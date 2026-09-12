import { z } from "zod"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOptionalUserId } from "@/lib/apiAuth"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const input = z.object({
    sort: z.enum(["newest", "oldest", "popular", "most-copied"]).default("newest"),
    lang: z.string().optional(),
    search: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
  }).parse({
    sort: searchParams.get("sort") ?? "newest",
    lang: searchParams.get("lang") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    page: searchParams.get("page") ?? "1",
  })

  const userId = await getOptionalUserId()
  const limit = 5
  const where = {
    isPublic: true,
    ...(input.lang && { language: input.lang }),
    ...(input.search && {
      OR: [
        { title: { contains: input.search, mode: "insensitive" as const } },
        { description: { contains: input.search, mode: "insensitive" as const } },
        { tags: { some: { tag: { name: { contains: input.search, mode: "insensitive" as const } } } } },
      ],
    }),
  }
  const orderBy =
    input.sort === "oldest" ? { createdAt: "asc" as const } :
    input.sort === "popular" ? { likes: { _count: "desc" as const } } :
    input.sort === "most-copied" ? { copyCount: "desc" as const } :
    { createdAt: "desc" as const }

  const [snippets, total] = await Promise.all([
    prisma.snippet.findMany({
      where, orderBy,
      skip: (input.page - 1) * limit,
      take: limit,
      include: {
        tags: { include: { tag: true } },
        user: { select: { id: true, name: true, avatar: true } },
        likes: userId ? { where: { userId }, select: { userId: true } } : false,
        _count: { select: { likes: true } },
      },
    }),
    prisma.snippet.count({ where }),
  ])

  return NextResponse.json({
    snippets: snippets.map((s) => ({
      id: s.id, title: s.title, description: s.description, code: s.code,
      language: s.language, copyCount: s.copyCount, createdAt: s.createdAt,
      tags: s.tags.map((t) => t.tag.name), user: s.user,
      likeCount: s._count.likes,
      likedByMe: userId ? (s.likes as { userId: number }[]).length > 0 : false,
    })),
    total, page: input.page, totalPages: Math.ceil(total / limit),
  })
}
