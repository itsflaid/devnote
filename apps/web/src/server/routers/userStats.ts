import { router, protectedProcedure } from "../trpc"

export const userStatsRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const [snippets, collections] = await Promise.all([
      ctx.prisma.snippet.findMany({
        where: { userId: ctx.userId },
        select: { language: true, isFavorite: true, copyCount: true, isPublic: true, tags: { select: { tag: { select: { name: true } } } } },
      }),
      ctx.prisma.collection.count({ where: { userId: ctx.userId } }),
    ])

    const langMap = snippets.reduce<Record<string, number>>((acc, s) => {
      acc[s.language] = (acc[s.language] ?? 0) + 1
      return acc
    }, {})
    const topLanguages = Object.entries(langMap).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }))
    const tagSet = new Set<string>()
    snippets.forEach((s) => s.tags.forEach((t) => tagSet.add(t.tag.name)))

    return {
      totalSnippets: snippets.length,
      totalFavorites: snippets.filter((s) => s.isFavorite).length,
      totalPublic: snippets.filter((s) => s.isPublic).length,
      totalCopies: snippets.reduce((acc, s) => acc + s.copyCount, 0),
      totalCollections: collections,
      totalLanguages: Object.keys(langMap).length,
      totalTags: tagSet.size,
      topLanguages,
    }
  }),
})
