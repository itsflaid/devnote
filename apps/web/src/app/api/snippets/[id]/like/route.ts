import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/apiAuth"
import { prisma } from "@/lib/prisma"

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  const { id } = await params
  const existing = await prisma.like.findUnique({
    where: { userId_snippetId: { userId: authResult.userId, snippetId: Number(id) } },
  })
  if (existing) {
    await prisma.like.delete({
      where: { userId_snippetId: { userId: authResult.userId, snippetId: Number(id) } },
    })
    const count = await prisma.like.count({ where: { snippetId: Number(id) } })
    return NextResponse.json({ liked: false, count })
  }
  await prisma.like.create({ data: { userId: authResult.userId, snippetId: Number(id) } })
  const count = await prisma.like.count({ where: { snippetId: Number(id) } })
  return NextResponse.json({ liked: true, count })
}
