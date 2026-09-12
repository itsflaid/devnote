import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/apiAuth"
import { prisma } from "@/lib/prisma"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  const { id } = await params
  const assigned = await prisma.snippetCollection.findMany({
    where: { snippetId: Number(id) },
    include: { collection: { select: { id: true, name: true } } },
  })
  return NextResponse.json(assigned.map((a) => a.collection))
}
