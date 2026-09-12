import { z } from "zod"
import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/apiAuth"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/apiError"

const snippetInput = z.object({
  title: z.string().min(1),
  language: z.string().min(1),
  description: z.string().min(1),
  code: z.string().min(1),
  tags: z.array(z.string()).optional(),
  workspaceId: z.number().nullable().optional(),
})

export async function GET(request: Request) {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  const { searchParams } = new URL(request.url)
  const lang = searchParams.get("lang") ?? undefined
  const tag = searchParams.get("tag") ?? undefined
  const filter = searchParams.get("filter") as "favorites" | "public" | null
  const collection = searchParams.get("collection") ? Number(searchParams.get("collection")) : undefined

  const snippets = await prisma.snippet.findMany({
    where: {
      userId: authResult.userId,
      ...(lang && { language: lang }),
      ...(filter === "favorites" && { isFavorite: true }),
      ...(filter === "public" && { isPublic: true }),
      ...(tag && { tags: { some: { tag: { name: tag } } } }),
      ...(collection && { collections: { some: { collectionId: collection } } }),
    },
    include: { tags: { include: { tag: true } } },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(snippets)
}

export async function POST(request: Request) {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  try {
    const body = await request.json()
    const input = snippetInput.parse(body)

    if (input.workspaceId) {
      const { requireWorkspaceRole } = await import("@/lib/workspace")
      const member = await requireWorkspaceRole(input.workspaceId, authResult.userId, ["OWNER", "EDITOR"])
      if (!member) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const snippet = await prisma.snippet.create({
      data: {
        title: input.title,
        language: input.language,
        description: input.description.trim(),
        code: input.code,
        userId: authResult.userId,
        tags: {
          create: (input.tags ?? []).map((tagName) => ({
            tag: { connectOrCreate: { where: { name: tagName }, create: { name: tagName } } },
          })),
        },
      },
    })

    if (input.workspaceId) {
      await prisma.workspaceSnippet.create({
        data: { workspaceId: input.workspaceId, snippetId: snippet.id, addedById: authResult.userId },
      })
    }

    return NextResponse.json(snippet)
  } catch (err) {
    return handleApiError(err)
  }
}
