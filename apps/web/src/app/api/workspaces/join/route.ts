import { z } from "zod"
import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/apiAuth"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/apiError"
import { normalizeWorkspaceInviteCode } from "@/lib/workspaceInviteCode"

export async function POST(request: Request) {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  try {
    const body = await request.json()
    const input = z.object({ inviteCode: z.string() }).parse(body)

    const code = normalizeWorkspaceInviteCode(input.inviteCode)
    if (!code) {
      return NextResponse.json({ error: "Kode invite wajib diisi" }, { status: 400 })
    }

    const workspace = await prisma.workspace.findUnique({ where: { inviteCode: code } })
    if (!workspace) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const member = await prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId: workspace.id, userId: authResult.userId } },
      update: {},
      create: { workspaceId: workspace.id, userId: authResult.userId, role: "VIEWER" },
    })
    return NextResponse.json({ workspace, role: member.role })
  } catch (err) {
    return handleApiError(err)
  }
}
