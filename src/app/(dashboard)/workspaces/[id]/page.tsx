import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import WorkspaceRoleBadge from "@/components/workspace/WorkspaceRoleBadge"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function WorkspaceDetailPage({ params }: PageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const userId = Number(session.user.id)
  const { id } = await params
  const workspaceId = Number(id)

  if (Number.isNaN(workspaceId)) {
    notFound()
  }

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  })

  if (!member) {
    notFound()
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
    notFound()
  }

  const workspaceSnippets = await prisma.workspaceSnippet.findMany({
    where: { workspaceId },
    include: {
      snippet: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          tags: {
            include: {
              tag: true,
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

  const canEdit = member.role === "OWNER" || member.role === "EDITOR"
  const isOwner = member.role === "OWNER"

  return (
    <main className="min-h-full bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-6xl mx-auto px-5 py-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 mb-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[11px] uppercase tracking-[2px] text-[var(--em)] font-semibold">
                  Workspace
                </p>
                <WorkspaceRoleBadge role={member.role} />
              </div>

              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {workspace.name}
              </h1>

              <p className="text-sm text-[var(--text3)] mt-2 max-w-2xl">
                {workspace.description || "Tidak ada deskripsi workspace."}
              </p>

              <div className="flex flex-wrap gap-2 mt-4 text-xs text-[var(--text4)]">
                <span className="px-3 py-1 rounded-full bg-[var(--bg)] border border-[var(--border)]">
                  {workspace._count.snippets} snippets
                </span>

                <span className="px-3 py-1 rounded-full bg-[var(--bg)] border border-[var(--border)]">
                  {workspace._count.members} members
                </span>

                <span className="px-3 py-1 rounded-full bg-[var(--bg)] border border-[var(--border)] font-mono">
                  {workspace.inviteCode}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {canEdit && (
                <>
                  <button className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text2)] hover:bg-[var(--surface2)] transition-all">
                    Add Existing
                  </button>

                  <button className="px-4 py-2 rounded-lg bg-[var(--em)] text-[#0a0a0a] text-sm font-semibold hover:opacity-90 transition-all">
                    New Snippet
                  </button>
                </>
              )}

              {isOwner && (
                <button className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text2)] hover:bg-[var(--surface2)] transition-all">
                  Settings
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold">Workspace Snippets</h2>
            <p className="text-sm text-[var(--text4)]">
              Snippet yang dibagikan di workspace ini.
            </p>
          </div>
        </div>

        {workspaceSnippets.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {workspaceSnippets.map((item) => (
              <div
                key={`${item.workspaceId}-${item.snippetId}`}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-[var(--em-border)] transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">
                      {item.snippet.title}
                    </h3>
                    <p className="text-xs text-[var(--text4)] mt-1">
                      by {item.snippet.user?.name || item.snippet.user?.email || "Unknown"}
                    </p>
                  </div>

                  <span className="text-[10px] uppercase tracking-[1px] px-2 py-1 rounded-full border border-[var(--border)] bg-[var(--bg)] text-[var(--text3)] shrink-0">
                    {item.snippet.language}
                  </span>
                </div>

                <pre className="max-h-32 overflow-hidden rounded-xl bg-[var(--bg)] border border-[var(--border)] p-3 text-xs text-[var(--text3)]">
                  <code>{item.snippet.code}</code>
                </pre>

                {item.snippet.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.snippet.tags.map(({ tag }) => (
                      <span
                        key={tag.id}
                        className="text-[10px] font-mono px-2 py-[3px] rounded-full border border-[var(--border)] text-[var(--text4)]"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {canEdit && (
                  <div className="flex justify-end mt-3">
                    <button className="text-xs text-red-400 hover:text-red-300">
                      Remove from workspace
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">
              Belum ada snippet di workspace ini
            </h3>

            <p className="text-sm text-[var(--text3)] max-w-md mx-auto mb-5">
              Tambahkan snippet baru atau ambil dari library pribadi kamu.
            </p>

            {canEdit && (
              <div className="flex justify-center gap-2">
                <button className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text2)] hover:bg-[var(--surface2)] transition-all">
                  Add Existing
                </button>

                <button className="px-4 py-2 rounded-lg bg-[var(--em)] text-[#0a0a0a] text-sm font-semibold hover:opacity-90 transition-all">
                  New Snippet
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}