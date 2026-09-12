import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/apiAuth"
import { requireWorkspaceRole } from "@/lib/workspace"
import { prisma } from "@/lib/prisma"

export async function POST(_request: Request, { params }: { params: Promise<{ id: string; memberId: string }> }) {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  const { id, memberId } = await params
  const owner = await requireWorkspaceRole(Number(id), authResult.userId, ["OWNER"])
  if (!owner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const target = await prisma.workspaceMember.findFirst({
    where: { id: Number(memberId), workspaceId: Number(id), role: { not: "OWNER" } },
    select: { id: true, userId: true },
  })
  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.$transaction([
    prisma.workspace.update({ where: { id: Number(id) }, data: { ownerId: target.userId } }),
    prisma.workspaceMember.update({ where: { id: owner.id }, data: { role: "EDITOR" } }),
    prisma.workspaceMember.update({ where: { id: target.id }, data: { role: "OWNER" } }),
  ])
  return NextResponse.json({ success: true })
}
