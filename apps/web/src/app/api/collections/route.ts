import { z } from "zod"
import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/apiAuth"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/apiError"

export async function GET() {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  const collections = await prisma.collection.findMany({
    where: { userId: authResult.userId },
    include: { _count: { select: { snippets: true } } },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(collections)
}

export async function POST(request: Request) {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  try {
    const body = await request.json()
    const input = z.object({ name: z.string().min(1) }).parse(body)

    const collection = await prisma.collection.create({
      data: { name: input.name.trim(), userId: authResult.userId },
    })
    return NextResponse.json(collection)
  } catch (err) {
    return handleApiError(err)
  }
}
