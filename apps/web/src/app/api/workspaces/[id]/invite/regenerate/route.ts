import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/apiAuth"
import { requireWorkspaceRole } from "@/lib/workspace"
import { prisma } from "@/lib/prisma"
import { generateWorkspaceInviteCode } from "@/lib/workspaceInviteCode"

async function uniqueInviteCode() {
  let code = generateWorkspaceInviteCode()
  while (await prisma.workspace.findUnique({ where: { inviteCode: code } })) {
    code = generateWorkspaceInviteCode()
  }
  return code
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  const { id } = await params
  const member = await requireWorkspaceRole(Number(id), authResult.userId, ["OWNER"])
  if (!member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const inviteCode = await uniqueInviteCode()
  const workspace = await prisma.workspace.update({
    where: { id: Number(id) },
    data: { inviteCode },
    select: { inviteCode: true },
  })
  return NextResponse.json(workspace)
}
