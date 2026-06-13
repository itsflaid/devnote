import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import WorkspaceCard from "@/components/workspace/WorkspaceCard"
import CreateWorkspaceModal from "@/components/workspace/CreateWorkspaceModal"
import JoinWorkspaceModal from "@/components/workspace/JoinWorkspaceModal"

interface PageProps {
  searchParams: Promise<{
    action?: string
  }>
}

export default async function WorkspacesPage({ searchParams }: PageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const userId = Number(session.user.id)
  const { action } = await searchParams

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    select: {
      role: true,
      workspace: {
        select: {
          id: true,
          name: true,
          description: true,
          inviteCode: true,
          createdAt: true,
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
    role: member.role,
    snippetsCount: member.workspace._count.snippets,
    membersCount: member.workspace._count.members,
    createdAt: member.workspace.createdAt.toISOString(),
  }))

  return (
    <main className="min-h-full p-4 text-[var(--text)] sm:p-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[2px] text-[var(--text4)]">
              Devnote
            </p>
            <h1 className="text-2xl font-semibold">Workspaces</h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--text3)]">
              Ruang kolaborasi untuk mengelompokkan note berdasarkan project,
              tim, atau kelas.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Link
              href="/workspaces?action=join"
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-center text-sm text-[var(--text2)] transition-all hover:bg-[var(--surface2)]"
            >
              Gabung
            </Link>
            <Link
              href="/workspaces?action=create"
              className="rounded-lg bg-[var(--em)] px-4 py-2 text-center text-sm font-semibold text-[#0a0a0a] transition-all hover:opacity-90"
            >
              Buat Workspace
            </Link>
          </div>
        </div>

        {workspaces.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {workspaces.map((workspace) => (
              <WorkspaceCard key={workspace.id} workspace={workspace} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <div className="max-w-md">
              <h2 className="text-lg font-semibold">Belum ada workspace</h2>
              <p className="mt-2 text-sm text-[var(--text3)]">
                Buat workspace baru atau gabung memakai invite code dari owner.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:justify-center">
                <Link
                  href="/workspaces?action=join"
                  className="rounded-lg border border-[var(--border)] px-4 py-2 text-center text-sm text-[var(--text2)] transition-all hover:bg-[var(--surface2)]"
                >
                  Gabung
                </Link>
                <Link
                  href="/workspaces?action=create"
                  className="rounded-lg bg-[var(--em)] px-4 py-2 text-center text-sm font-semibold text-[#0a0a0a] transition-all hover:opacity-90"
                >
                  Buat Workspace
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {action === "create" && <CreateWorkspaceModal />}
      {action === "join" && <JoinWorkspaceModal />}
    </main>
  )
}
