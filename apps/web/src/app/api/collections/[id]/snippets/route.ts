import { z } from "zod"
import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/apiAuth"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/apiError"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  const { id } = await params
  const collection = await prisma.collection.findFirst({
    where: { id: Number(id), userId: authResult.userId },
    include: {
      snippets: { include: { snippet: { include: { tags: { include: { tag: true } } } } } },
    },
  })
  if (!collection) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json(collection)
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  try {
    const { id } = await params
    const body = await request.json()
    const input = z.object({ snippetId: z.number() }).parse(body)

    await prisma.snippetCollection.create({
      data: { collectionId: Number(id), snippetId: input.snippetId },
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return handleApiError(err)
  }
}
