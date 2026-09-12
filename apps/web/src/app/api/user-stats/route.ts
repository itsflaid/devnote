import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/apiAuth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  const { userId } = authResult
  const [snippets, collections] = await Promise.all([
    prisma.snippet.findMany({
      where: { userId },
      select: { language: true, isFavorite: true, copyCount: true, isPublic: true, tags: { select: { tag: { select: { name: true } } } } },
    }),
    prisma.collection.count({ where: { userId } }),
  ])

  const langMap = snippets.reduce<Record<string, number>>((acc, s) => {
    acc[s.language] = (acc[s.language] ?? 0) + 1
    return acc
  }, {})
  const topLanguages = Object.entries(langMap).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }))
  const tagSet = new Set<string>()
  snippets.forEach((s) => s.tags.forEach((t) => tagSet.add(t.tag.name)))

  return NextResponse.json({
    totalSnippets: snippets.length,
    totalFavorites: snippets.filter((s) => s.isFavorite).length,
    totalPublic: snippets.filter((s) => s.isPublic).length,
    totalCopies: snippets.reduce((acc, s) => acc + s.copyCount, 0),
    totalCollections: collections,
    totalLanguages: Object.keys(langMap).length,
    totalTags: tagSet.size,
    topLanguages,
  })
}
