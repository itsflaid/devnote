import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateInviteCode } from "@/lib/workspace"

export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const userId = Number(session.user.id)

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: {
        include: {
          _count: {
            select: {
              snippets: true,
              members: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const workspaces = memberships.map((member) => ({
    id: member.workspace.id,
    name: member.workspace.name,
    description: member.workspace.description,
    inviteCode: member.workspace.inviteCode,
    ownerId: member.workspace.ownerId,
    role: member.role,
    createdAt: member.workspace.createdAt,
    _count: member.workspace._count,
  }))

  return NextResponse.json({ workspaces })
}

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const userId = Number(session.user.id)
  const { name, description } = await req.json()

  if (!name?.trim()) {
    return NextResponse.json(
      { message: "Nama workspace wajib diisi" },
      { status: 400 }
    )
  }

  let inviteCode = generateInviteCode()

  while (await prisma.workspace.findUnique({ where: { inviteCode } })) {
    inviteCode = generateInviteCode()
  }

  const workspace = await prisma.workspace.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      inviteCode,
      ownerId: userId,
      members: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
    include: {
      _count: {
        select: {
          snippets: true,
          members: true,
        },
      },
      members: {
        where: { userId },
        select: { role: true },
      },
    },
  })

  return NextResponse.json(
    {
      workspace: {
        ...workspace,
        role: workspace.members[0]?.role ?? "OWNER",
      },
    },
    { status: 201 }
  )
}