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

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  const { id } = await params
  const snippet = await prisma.snippet.findFirst({
    where: { id: Number(id), userId: authResult.userId },
    include: { tags: { include: { tag: true } } },
  })
  if (!snippet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json(snippet)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  try {
    const { id } = await params
    const body = await request.json()
    const input = snippetInput.parse(body)

    const { canEditSnippetInAnyWorkspace } = await import("@/lib/workspace")
    const existing = await prisma.snippet.findUnique({
      where: { id: Number(id) },
      select: { userId: true },
    })
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const canEdit =
      existing.userId === authResult.userId ||
      (await canEditSnippetInAnyWorkspace(Number(id), authResult.userId))
    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.snippetTag.deleteMany({ where: { snippetId: Number(id) } })

    const updated = await prisma.snippet.update({
      where: { id: Number(id) },
      data: {
        title: input.title,
        language: input.language,
        description: input.description.trim(),
        code: input.code,
        tags: {
          create: (input.tags ?? []).map((tagName) => ({
            tag: { connectOrCreate: { where: { name: tagName }, create: { name: tagName } } },
          })),
        },
      },
    })
    return NextResponse.json(updated)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  const { id } = await params
  const snippet = await prisma.snippet.findFirst({
    where: { id: Number(id), userId: authResult.userId },
    select: { id: true },
  })
  if (!snippet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  await prisma.snippet.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}
