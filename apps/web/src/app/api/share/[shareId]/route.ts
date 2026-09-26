import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOptionalUserId } from "@/lib/apiAuth"

export async function GET(_request: Request, { params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params
  const userId = await getOptionalUserId()
  const snippet = await prisma.snippet.findUnique({
    where: { shareId },
    select: {
      id: true, title: true, description: true, code: true, language: true,
      isPublic: true, copyCount: true, createdAt: true, userId: true,
      user: { select: { id: true, name: true, avatar: true } },
      tags: { select: { tag: { select: { name: true } } } },
      _count: { select: { savedBy: true } },
    },
  })
  if (!snippet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  const isOwner = userId != null && snippet.userId === userId
  const isSaved = userId != null
    ? !!(await prisma.savedSnippet.findUnique({
        where: { userId_snippetId: { userId, snippetId: snippet.id } },
      }))
    : false
  return NextResponse.json({
    ...snippet,
    tags: snippet.tags.map((t) => t.tag.name),
    saveCount: snippet._count.savedBy,
    isSaved,
    isOwner,
  })
}
