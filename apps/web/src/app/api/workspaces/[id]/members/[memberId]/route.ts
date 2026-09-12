import { z } from "zod"
import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/apiAuth"
import { requireWorkspaceRole } from "@/lib/workspace"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/apiError"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; memberId: string }> }) {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  try {
    const { id, memberId } = await params
    const body = await request.json()
    const input = z.object({ role: z.enum(["EDITOR", "VIEWER"]) }).parse(body)

    const owner = await requireWorkspaceRole(Number(id), authResult.userId, ["OWNER"])
    if (!owner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const target = await prisma.workspaceMember.findFirst({
      where: { id: Number(memberId), workspaceId: Number(id) },
      select: { id: true, role: true },
    })
    if (!target) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    if (target.role === "OWNER") {
      return NextResponse.json({ error: "Role owner tidak dapat diubah" }, { status: 400 })
    }

    const updated = await prisma.workspaceMember.update({
      where: { id: target.id },
      data: { role: input.role },
      select: {
        id: true, role: true, createdAt: true,
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    })
    return NextResponse.json(updated)
  } catch (err) {
    return handleApiError(err)
  }
}
