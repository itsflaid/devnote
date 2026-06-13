import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requireWorkspaceRole } from "@/lib/workspace"

const editableRoles = ["EDITOR", "VIEWER"] as const

async function getOwner(workspaceId: number) {
  const session = await auth()

  if (!session?.user) {
    return { error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) }
  }

  const owner = await requireWorkspaceRole(
    workspaceId,
    Number(session.user.id),
    ["OWNER"]
  )

  if (!owner) {
    return { error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) }
  }

  return { owner }
}

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const workspaceId = Number(id)

  if (!Number.isInteger(workspaceId)) {
    return NextResponse.json(
      { message: "Workspace tidak valid" },
      { status: 400 }
    )
  }

  const authorization = await getOwner(workspaceId)

  if (authorization.error) {
    return authorization.error
  }

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    select: {
      id: true,
      role: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json({
    members: members.sort((a, b) => {
      if (a.role === "OWNER") return -1
      if (b.role === "OWNER") return 1
      return 0
    }),
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const workspaceId = Number(id)

  if (!Number.isInteger(workspaceId)) {
    return NextResponse.json(
      { message: "Workspace tidak valid" },
      { status: 400 }
    )
  }

  const authorization = await getOwner(workspaceId)

  if (authorization.error) {
    return authorization.error
  }

  const { memberId, role } = await req.json()
  const parsedMemberId = Number(memberId)

  if (
    !Number.isInteger(parsedMemberId) ||
    !editableRoles.includes(role as (typeof editableRoles)[number])
  ) {
    return NextResponse.json(
      { message: "Member atau role tidak valid" },
      { status: 400 }
    )
  }

  const target = await prisma.workspaceMember.findFirst({
    where: {
      id: parsedMemberId,
      workspaceId,
    },
    select: {
      id: true,
      role: true,
    },
  })

  if (!target) {
    return NextResponse.json(
      { message: "Member tidak ditemukan" },
      { status: 404 }
    )
  }

  if (target.role === "OWNER") {
    return NextResponse.json(
      { message: "Role owner tidak dapat diubah" },
      { status: 400 }
    )
  }

  const member = await prisma.workspaceMember.update({
    where: { id: target.id },
    data: { role },
    select: {
      id: true,
      role: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  })

  return NextResponse.json({ member })
}
