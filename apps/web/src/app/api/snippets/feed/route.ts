import { z } from "zod"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const input = z.object({
    language: z.string().optional(),
    tag: z.string().optional(),
    sort: z.enum(["popular", "mostcopied", "newest"]).optional(),
  }).parse({
    language: searchParams.get("language") ?? undefined,
    tag: searchParams.get("tag") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
  })

  const snippets = await prisma.snippet.findMany({
    where: {
      isPublic: true,
      ...(input.language && { language: input.language }),
      ...(input.tag && { tags: { some: { tag: { name: input.tag } } } }),
    },
    orderBy:
      input.sort === "popular" ? { likes: { _count: "desc" } } :
      input.sort === "mostcopied" ? { copyCount: "desc" } :
      { createdAt: "desc" },
    include: {
      tags: { include: { tag: true } },
      user: { select: { name: true, avatar: true } },
      likes: true,
      _count: { select: { likes: true } },
    },
    take: 20,
  })
  return NextResponse.json(snippets)
}
