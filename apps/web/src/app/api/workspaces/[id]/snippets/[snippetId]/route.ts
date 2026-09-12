import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/apiAuth"
import { requireWorkspaceRole } from "@/lib/workspace"
import { prisma } from "@/lib/prisma"

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; snippetId: string }> }) {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  const { id, snippetId } = await params
  const member = await requireWorkspaceRole(Number(id), authResult.userId, ["OWNER", "EDITOR"])
  if (!member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.workspaceSnippet.delete({
    where: { workspaceId_snippetId: { workspaceId: Number(id), snippetId: Number(snippetId) } },
  })
  return NextResponse.json({ message: "Note berhasil di-remove dari workspace" })
}
