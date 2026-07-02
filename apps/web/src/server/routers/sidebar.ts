import { router, protectedProcedure } from "../trpc"

export const sidebarRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const [totalSnippets, totalCopiesResult, totalFavorites, totalPublic, tags, workspaceSnippetsCount, memberships] =
      await Promise.all([
        ctx.prisma.snippet.count({ where: { userId: ctx.userId } }),
        ctx.prisma.snippet.aggregate({ where: { userId: ctx.userId }, _sum: { copyCount: true } }),
        ctx.prisma.snippet.count({ where: { userId: ctx.userId, isFavorite: true } }),
        ctx.prisma.snippet.count({ where: { userId: ctx.userId, isPublic: true } }),
        ctx.prisma.tag.findMany({
          where: { snippets: { some: { snippet: { userId: ctx.userId } } } },
          select: { name: true, _count: { select: { snippets: true } } },
          orderBy: { name: "asc" },
        }),
        ctx.prisma.snippet.count({
          where: { userId: ctx.userId, workspaces: { some: { workspace: { members: { some: { userId: ctx.userId } } } } } },
        }),
        ctx.prisma.workspaceMember.findMany({
          where: { userId: ctx.userId },
          include: { workspace: { include: { _count: { select: { snippets: true, members: true } } } } },
          orderBy: { createdAt: "desc" },
        }),
      ])

    return {
      totalSnippets,
      totalCopies: totalCopiesResult._sum.copyCount ?? 0,
      totalFavorites, totalPublic, workspaceSnippetsCount,
      workspaces: memberships.map((m) => ({
        id: m.workspace.id, name: m.workspace.name, role: m.role, snippetsCount: m.workspace._count.snippets,
      })),
      tags: tags.map((t) => ({ name: t.name, count: t._count.snippets })),
    }
  }),
})
