import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requireWorkspaceRole } from "@/lib/workspace"

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const userId = Number(session.user.id)
  const { id } = await params
  const workspaceId = Number(id)

  const member = await requireWorkspaceRole(workspaceId, userId, [
    "OWNER",
    "EDITOR",
    "VIEWER",
  ])

  if (!member) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const relations = await prisma.workspaceSnippet.findMany({
    where: { workspaceId },
    include: {
      snippet: {
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      },
      addedBy: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const snippets = relations.map((relation) => ({
    ...relation.snippet,
    workspaceMeta: {
      workspaceId: relation.workspaceId,
      addedBy: relation.addedBy,
      addedAt: relation.createdAt,
    },
  }))

  return NextResponse.json({
    snippets,
    role: member.role,
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const userId = Number(session.user.id)
  const { id } = await params
  const workspaceId = Number(id)
  const { snippetId } = await req.json()

  const member = await requireWorkspaceRole(workspaceId, userId, [
    "OWNER",
    "EDITOR",
  ])

  if (!member) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const snippet = await prisma.snippet.findFirst({
    where: {
      id: Number(snippetId),
      userId,
    },
  })

  if (!snippet) {
    return NextResponse.json(
      { message: "Note tidak ditemukan di library kamu" },
      { status: 404 }
    )
  }

  const relation = await prisma.workspaceSnippet.upsert({
    where: {
      workspaceId_snippetId: {
        workspaceId,
        snippetId: snippet.id,
      },
    },
    update: {},
    create: {
      workspaceId,
      snippetId: snippet.id,
      addedById: userId,
    },
  })

  return NextResponse.json({ relation }, { status: 201 })
}
