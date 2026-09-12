import { z } from "zod"
import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/apiAuth"
import { requireWorkspaceRole } from "@/lib/workspace"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/apiError"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  const { id } = await params
  const owner = await requireWorkspaceRole(Number(id), authResult.userId, ["OWNER"])
  if (!owner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: Number(id) },
    select: {
      id: true, role: true, createdAt: true,
      user: { select: { id: true, name: true, email: true, avatar: true } },
    },
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json(members.sort((a, b) => (a.role === "OWNER" ? -1 : b.role === "OWNER" ? 1 : 0)))
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  try {
    const { id } = await params
    let memberId: number | undefined
    try {
      const body = await request.json()
      memberId = body.memberId
    } catch {
      // no body
    }

    const requester = await requireWorkspaceRole(Number(id), authResult.userId, ["OWNER", "EDITOR", "VIEWER"])
    if (!requester) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (requester.role === "OWNER") {
      if (!memberId) {
        return NextResponse.json({ error: "Member tidak valid" }, { status: 400 })
      }
      const target = await prisma.workspaceMember.findFirst({
        where: { id: memberId, workspaceId: Number(id), role: { not: "OWNER" } },
        select: { id: true },
      })
      if (!target) {
        return NextResponse.json({ error: "Not found" }, { status: 404 })
      }
      await prisma.workspaceMember.delete({ where: { id: target.id } })
      return NextResponse.json({ success: true })
    }

    await prisma.workspaceMember.delete({ where: { id: requester.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return handleApiError(err)
  }
}
