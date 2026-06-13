import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requireWorkspaceRole } from "@/lib/workspace"

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string; snippetId: string }> }
) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const userId = Number(session.user.id)
  const { id, snippetId } = await params

  const workspaceId = Number(id)
  const targetSnippetId = Number(snippetId)

  const member = await requireWorkspaceRole(workspaceId, userId, [
    "OWNER",
    "EDITOR",
  ])

  if (!member) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  await prisma.workspaceSnippet.delete({
    where: {
      workspaceId_snippetId: {
        workspaceId,
        snippetId: targetSnippetId,
      },
    },
  })

  return NextResponse.json({
    message: "Note berhasil di-remove dari workspace",
  })
}
