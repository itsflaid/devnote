import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/apiAuth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  const saved = await prisma.savedSnippet.findMany({
    where: { userId: authResult.userId },
    orderBy: { savedAt: "desc" },
    include: {
      snippet: {
        include: {
          tags: { include: { tag: true } },
          user: { select: { id: true, name: true, avatar: true } },
          _count: { select: { likes: true, savedBy: true } },
        },
      },
    },
  })

  const items = await Promise.all(
    saved.map(async (s) => {
      const snippet = s.snippet
      // Deleted rows are removed by Cascade, so only private-check remains.
      const unavailable = !snippet || !snippet.isPublic
      if (unavailable) {
        return {
          savedAt: s.savedAt,
          snippetId: s.snippetId,
          unavailable: true as const,
          snippet: null,
        }
      }
      const likedByMe = await prisma.like.findUnique({
        where: { userId_snippetId: { userId: authResult.userId, snippetId: s.snippetId } },
      })
      return {
        savedAt: s.savedAt,
        snippetId: s.snippetId,
        unavailable: false as const,
        snippet: {
          id: snippet.id,
          title: snippet.title,
          description: snippet.description,
          code: snippet.code,
          language: snippet.language,
          copyCount: snippet.copyCount,
          createdAt: snippet.createdAt,
          tags: snippet.tags.map((t) => t.tag.name),
          user: snippet.user,
          likeCount: snippet._count.likes,
          likedByMe: !!likedByMe,
          saveCount: snippet._count.savedBy,
          savedByMe: true,
        },
      }
    }),
  )

  return NextResponse.json(items)
}
