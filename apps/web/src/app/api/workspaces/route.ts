import { z } from "zod"
import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/apiAuth"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/apiError"
import { generateWorkspaceInviteCode } from "@/lib/workspaceInviteCode"

async function uniqueInviteCode() {
  let code = generateWorkspaceInviteCode()
  while (await prisma.workspace.findUnique({ where: { inviteCode: code } })) {
    code = generateWorkspaceInviteCode()
  }
  return code
}

export async function GET() {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: authResult.userId },
    include: { workspace: { include: { _count: { select: { snippets: true, members: true } } } } },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(memberships.map((m) => ({
    id: m.workspace.id, name: m.workspace.name, description: m.workspace.description,
    inviteCode: m.workspace.inviteCode, ownerId: m.workspace.ownerId, role: m.role,
    createdAt: m.workspace.createdAt, _count: m.workspace._count,
  })))
}

export async function POST(request: Request) {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  try {
    const body = await request.json()
    const input = z.object({ name: z.string().min(1), description: z.string().optional() }).parse(body)

    const inviteCode = await uniqueInviteCode()
    const workspace = await prisma.workspace.create({
      data: {
        name: input.name.trim(),
        description: input.description?.trim() || null,
        inviteCode,
        ownerId: authResult.userId,
        members: { create: { userId: authResult.userId, role: "OWNER" } },
      },
      include: {
        _count: { select: { snippets: true, members: true } },
        members: { where: { userId: authResult.userId }, select: { role: true } },
      },
    })
    return NextResponse.json({ ...workspace, role: workspace.members[0]?.role ?? "OWNER" })
  } catch (err) {
    return handleApiError(err)
  }
}
