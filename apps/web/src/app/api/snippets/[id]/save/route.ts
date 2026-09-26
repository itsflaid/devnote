import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/apiAuth"
import { prisma } from "@/lib/prisma"

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  const { id } = await params
  const snippetId = Number(id)
  if (!Number.isFinite(snippetId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  const existing = await prisma.savedSnippet.findUnique({
    where: { userId_snippetId: { userId: authResult.userId, snippetId } },
  })

  if (existing) {
    await prisma.savedSnippet.delete({
      where: { userId_snippetId: { userId: authResult.userId, snippetId } },
    })
    const saveCount = await prisma.savedSnippet.count({ where: { snippetId } })
    return NextResponse.json({ isSaved: false, saveCount })
  }

  const snippet = await prisma.snippet.findUnique({
    where: { id: snippetId },
    select: { id: true, isPublic: true, userId: true },
  })
  if (!snippet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  if (!snippet.isPublic && snippet.userId !== authResult.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.savedSnippet.create({
    data: { userId: authResult.userId, snippetId },
  })
  const saveCount = await prisma.savedSnippet.count({ where: { snippetId } })
  return NextResponse.json({ isSaved: true, saveCount })
}
