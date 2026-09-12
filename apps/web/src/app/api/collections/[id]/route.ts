import { z } from "zod"
import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/apiAuth"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/apiError"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  try {
    const { id } = await params
    const body = await request.json()
    const input = z.object({ name: z.string().min(1) }).parse(body)

    const collection = await prisma.collection.update({
      where: { id: Number(id), userId: authResult.userId },
      data: { name: input.name.trim() },
    })
    return NextResponse.json(collection)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  try {
    const { id } = await params
    await prisma.collection.delete({ where: { id: Number(id), userId: authResult.userId } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return handleApiError(err)
  }
}
