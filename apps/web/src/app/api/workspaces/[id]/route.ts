import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requireWorkspaceRole } from "@/lib/workspace"
import { generateWorkspaceInviteCode } from "@/lib/workspaceInviteCode"

function parseWorkspaceId(id: string) {
  const workspaceId = Number(id)
  return Number.isInteger(workspaceId) && workspaceId > 0 ? workspaceId : null
}

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
  const workspaceId = parseWorkspaceId(id)

  if (!workspaceId) {
    return NextResponse.json(
      { message: "Workspace tidak valid" },
      { status: 400 }
    )
  }

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
  const workspaceId = parseWorkspaceId(id)
  const { name, description } = await req.json()

  if (!workspaceId) {
    return NextResponse.json(
      { message: "Workspace tidak valid" },
      { status: 400 }
    )
  }

  const normalizedName = String(name ?? "").trim()

  if (!normalizedName) {
    return NextResponse.json(
      { message: "Nama workspace wajib diisi" },
      { status: 400 }
    )
  }

  const member = await requireWorkspaceRole(workspaceId, userId, ["OWNER"])

  if (!member) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const workspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      name: normalizedName,
      description: String(description ?? "").trim() || null,
    },
    select: {
      id: true,
      name: true,
      description: true,
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
  const workspaceId = parseWorkspaceId(id)

  if (!workspaceId) {
    return NextResponse.json(
      { message: "Workspace tidak valid" },
      { status: 400 }
    )
  }

  const member = await requireWorkspaceRole(workspaceId, userId, ["OWNER"])

  if (!member) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  let inviteCode = generateWorkspaceInviteCode()

  while (await prisma.workspace.findUnique({ where: { inviteCode } })) {
    inviteCode = generateWorkspaceInviteCode()
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

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const workspaceId = parseWorkspaceId(id)

  if (!workspaceId) {
    return NextResponse.json(
      { message: "Workspace tidak valid" },
      { status: 400 }
    )
  }

  const owner = await requireWorkspaceRole(
    workspaceId,
    Number(session.user.id),
    ["OWNER"]
  )

  if (!owner) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  await prisma.workspace.delete({
    where: { id: workspaceId },
  })

  return NextResponse.json({ success: true })
}
