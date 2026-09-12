import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/apiAuth"
import { prisma } from "@/lib/prisma"

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  const { id } = await params
  const snippet = await prisma.snippet.findUnique({
    where: { id: Number(id) },
    select: { id: true, userId: true, shareId: true },
  })
  if (!snippet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  if (snippet.userId !== authResult.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const newShareId = snippet.shareId
    ? null
    : (() => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ"
        let result = ""
        for (let i = 0; i < 9; i++) result += chars[Math.floor(Math.random() * chars.length)]
        return result
      })()

  const updated = await prisma.snippet.update({
    where: { id: Number(id) },
    data: { shareId: newShareId },
    select: { shareId: true },
  })
  return NextResponse.json(updated)
}
