import { prisma } from "@/lib/prisma"

export interface SidebarData {
  totalSnippets: number
  totalCopies: number
  totalFavorites: number
  totalPublic: number
  workspaceSnippetsCount: number
  workspaces: {
    id: number
    name: string
    role: "OWNER" | "EDITOR" | "VIEWER"
    snippetsCount: number
  }[]
  tags: { name: string; count: number }[]
}

export async function getSidebarData(userId: number): Promise<SidebarData> {
  const [totalSnippets, totalCopiesResult, totalFavorites, totalPublic, tags, workspaceSnippetsCount, memberships] =
    await Promise.all([
      prisma.snippet.count({ where: { userId } }),
      prisma.snippet.aggregate({ where: { userId }, _sum: { copyCount: true } }),
      prisma.snippet.count({ where: { userId, isFavorite: true } }),
      prisma.snippet.count({ where: { userId, isPublic: true } }),
      prisma.tag.findMany({
        where: { snippets: { some: { snippet: { userId } } } },
        select: { name: true, _count: { select: { snippets: true } } },
        orderBy: { name: "asc" },
      }),
      prisma.snippet.count({
        where: { userId, workspaces: { some: { workspace: { members: { some: { userId } } } } } },
      }),
      prisma.workspaceMember.findMany({
        where: { userId },
        include: { workspace: { include: { _count: { select: { snippets: true, members: true } } } } },
        orderBy: { createdAt: "desc" },
      }),
    ])

  return {
    totalSnippets,
    totalCopies: totalCopiesResult._sum.copyCount ?? 0,
    totalFavorites,
    totalPublic,
    workspaceSnippetsCount,
    workspaces: memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      role: m.role,
      snippetsCount: m.workspace._count.snippets,
    })),
    tags: tags.map((t) => ({ name: t.name, count: t._count.snippets })),
  }
}
