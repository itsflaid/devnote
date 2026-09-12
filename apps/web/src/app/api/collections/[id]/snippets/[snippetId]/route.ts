import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/apiAuth"
import { prisma } from "@/lib/prisma"

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; snippetId: string }> }) {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  const { id, snippetId } = await params
  await prisma.snippetCollection.delete({
    where: { snippetId_collectionId: { snippetId: Number(snippetId), collectionId: Number(id) } },
  })
  return NextResponse.json({ ok: true })
}
