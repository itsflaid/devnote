import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const userId = Number(session.user.id)
  const { inviteCode } = await req.json()

  const code = String(inviteCode ?? "").trim().toUpperCase()

  if (!code) {
    return NextResponse.json(
      { message: "Kode invite wajib diisi" },
      { status: 400 }
    )
  }

  const workspace = await prisma.workspace.findUnique({
    where: { inviteCode: code },
  })

  if (!workspace) {
    return NextResponse.json(
      { message: "Workspace tidak ditemukan" },
      { status: 404 }
    )
  }

  const member = await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId,
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      userId,
      role: "VIEWER",
    },
  })

  return NextResponse.json({
    workspace,
    role: member.role,
  })
}