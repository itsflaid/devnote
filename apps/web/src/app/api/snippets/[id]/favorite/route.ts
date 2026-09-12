import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/apiAuth"
import { prisma } from "@/lib/prisma"

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  const { id } = await params
  const snippet = await prisma.snippet.findFirst({
    where: { id: Number(id), userId: authResult.userId },
  })
  if (!snippet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  const updated = await prisma.snippet.update({
    where: { id: Number(id) },
    data: { isFavorite: !snippet.isFavorite },
    select: { isFavorite: true },
  })
  return NextResponse.json(updated)
}
