import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_request: Request, { params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params
  const snippet = await prisma.snippet.findUnique({
    where: { shareId },
    select: {
      id: true, title: true, description: true, code: true, language: true,
      isPublic: true, copyCount: true, createdAt: true,
      user: { select: { name: true, avatar: true } },
      tags: { select: { tag: { select: { name: true } } } },
    },
  })
  if (!snippet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json({ ...snippet, tags: snippet.tags.map((t) => t.tag.name) })
}
