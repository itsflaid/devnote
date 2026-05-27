import { prisma } from "@/lib/prisma"

type WorkspaceRole = "OWNER" | "EDITOR" | "VIEWER"

export function generateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = "DVNT-"

  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }

  return code
}

export async function getWorkspaceMember(workspaceId: number, userId: number) {
  return prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  })
}

export async function requireWorkspaceRole(
  workspaceId: number,
  userId: number,
  allowedRoles: WorkspaceRole[]
) {
  const member = await getWorkspaceMember(workspaceId, userId)

  if (!member || !allowedRoles.includes(member.role as WorkspaceRole)) {
    return null
  }

  return member
}

export async function canEditSnippetInAnyWorkspace(
  snippetId: number,
  userId: number
) {
  const relation = await prisma.workspaceSnippet.findFirst({
    where: {
      snippetId,
      workspace: {
        members: {
          some: {
            userId,
            role: {
              in: ["OWNER", "EDITOR"],
            },
          },
        },
      },
    },
  })

  return Boolean(relation)
}