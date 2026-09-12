import { z } from "zod"
import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/apiAuth"
import { requireWorkspaceRole } from "@/lib/workspace"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/apiError"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  const { id } = await params
  const member = await requireWorkspaceRole(Number(id), authResult.userId, ["OWNER", "EDITOR", "VIEWER"])
  if (!member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const relations = await prisma.workspaceSnippet.findMany({
    where: { workspaceId: Number(id) },
    include: {
      snippet: {
        include: {
          tags: { include: { tag: true } },
          user: { select: { id: true, name: true, email: true, avatar: true } },
        },
      },
      addedBy: { select: { id: true, name: true, email: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({
    snippets: relations.map((r) => ({
      ...r.snippet,
      workspaceMeta: { workspaceId: r.workspaceId, addedBy: r.addedBy, addedAt: r.createdAt },
    })),
    role: member.role,
  })
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  try {
    const { id } = await params
    const body = await request.json()
    const input = z.object({ snippetId: z.number() }).parse(body)

    const member = await requireWorkspaceRole(Number(id), authResult.userId, ["OWNER", "EDITOR"])
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const snippet = await prisma.snippet.findFirst({
      where: { id: input.snippetId, userId: authResult.userId },
    })
    if (!snippet) {
      return NextResponse.json({ error: "Note tidak ditemukan di library kamu" }, { status: 404 })
    }

    const result = await prisma.workspaceSnippet.upsert({
      where: { workspaceId_snippetId: { workspaceId: Number(id), snippetId: snippet.id } },
      update: {},
      create: { workspaceId: Number(id), snippetId: snippet.id, addedById: authResult.userId },
    })
    return NextResponse.json(result)
  } catch (err) {
    return handleApiError(err)
  }
}
