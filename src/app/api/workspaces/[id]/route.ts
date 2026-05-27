import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateInviteCode, requireWorkspaceRole } from "@/lib/workspace"

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

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      _count: {
        select: {
          snippets: true,
          members: true,
        },
      },
    },
  })

  if (!workspace) {
    return NextResponse.json(
      { message: "Workspace tidak ditemukan" },
      { status: 404 }
    )
  }

  return NextResponse.json({
    workspace: {
      ...workspace,
      role: member.role,
    },
  })
}

export async function PUT(
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
  const { name, description } = await req.json()

  const member = await requireWorkspaceRole(workspaceId, userId, ["OWNER"])

  if (!member) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const workspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      ...(name?.trim() && { name: name.trim() }),
      description: description?.trim() || null,
    },
  })

  return NextResponse.json({ workspace })
}

export async function PATCH(
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

  const member = await requireWorkspaceRole(workspaceId, userId, ["OWNER"])

  if (!member) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  let inviteCode = generateInviteCode()

  while (await prisma.workspace.findUnique({ where: { inviteCode } })) {
    inviteCode = generateInviteCode()
  }

  const workspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: { inviteCode },
    select: { inviteCode: true },
  })

  return NextResponse.json({
    inviteCode: workspace.inviteCode,
  })
}