import { z } from "zod"
import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/apiAuth"
import { prisma } from "@/lib/prisma"
import { requireWorkspaceRole } from "@/lib/workspace"
import { handleApiError } from "@/lib/apiError"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  const { id } = await params
  const member = await requireWorkspaceRole(Number(id), authResult.userId, ["OWNER", "EDITOR", "VIEWER"])
  if (!member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: Number(id) },
    include: {
      owner: { select: { id: true, name: true, email: true, avatar: true } },
      _count: { select: { snippets: true, members: true } },
    },
  })
  if (!workspace) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json({ ...workspace, role: member.role })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  try {
    const { id } = await params
    const body = await request.json()
    const input = z.object({ name: z.string().min(1), description: z.string().optional() }).parse(body)

    const member = await requireWorkspaceRole(Number(id), authResult.userId, ["OWNER"])
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const updated = await prisma.workspace.update({
      where: { id: Number(id) },
      data: { name: input.name.trim(), description: input.description?.trim() || null },
      select: { id: true, name: true, description: true },
    })
    return NextResponse.json(updated)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  const { id } = await params
  const owner = await requireWorkspaceRole(Number(id), authResult.userId, ["OWNER"])
  if (!owner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  await prisma.workspace.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}
