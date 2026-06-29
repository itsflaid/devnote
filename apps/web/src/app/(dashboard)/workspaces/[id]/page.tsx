import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import AddExistingSnippetModal from "@/components/workspace/AddExistingSnippetModal"
import WorkspaceSnippetModal from "@/components/workspace/WorkspaceSnippetModal"
import WorkspaceSnippetPanel from "@/components/workspace/WorkspaceSnippetPanel"
import type { Snippet } from "@/components/snippet/shared/types"
import WorkspaceHeader from "@/components/workspace/WorkspaceHeader"

interface PageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    action?: string
  }>
}

export default async function WorkspaceDetailPage({
  params,
  searchParams,
}: PageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const userId = Number(session.user.id)
  const { id } = await params
  const { action } = await searchParams

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
    select: {
      role: true,
      workspace: {
        select: {
          id: true,
          name: true,
          description: true,
          inviteCode: true,
          _count: {
            select: {
              snippets: true,
              members: true,
            },
          },
        },
      },
    },
  })

  if (!member?.workspace) {
    notFound()
  }

  const workspace = member.workspace
  const canEdit = member.role === "OWNER" || member.role === "EDITOR"
  const shouldLoadAvailableSnippets = canEdit && action === "add-existing"

  const [workspaceSnippets, availableSnippets] = await Promise.all([
    prisma.workspaceSnippet.findMany({
      where: { workspaceId },
      select: {
        workspaceId: true,
        snippetId: true,
        snippet: {
          select: {
            id: true,
            title: true,
            description: true,
            code: true,
            language: true,
            isPublic: true,
            isFavorite: true,
            copyCount: true,
            createdAt: true,
            shareId: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            tags: {
              select: {
                tag: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    shouldLoadAvailableSnippets
      ? prisma.snippet.findMany({
          where: {
            userId,
            workspaces: {
              none: {
                workspaceId,
              },
            },
          },
          select: {
            id: true,
            title: true,
            language: true,
            description: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        })
      : Promise.resolve([]),
  ])

  const snippets = workspaceSnippets.map((item) => {
    const snippet: Snippet = {
      id: item.snippet.id,
      title: item.snippet.title,
      description: item.snippet.description,
      code: item.snippet.code,
      language: item.snippet.language,
      isPublic: item.snippet.isPublic,
      isFavorite: item.snippet.isFavorite,
      copyCount: item.snippet.copyCount,
      createdAt: item.snippet.createdAt.toISOString(),
      shareId: item.snippet.shareId,
      tags: item.snippet.tags.map(({ tag }) => tag.name),
    }

    return {
      workspaceId: item.workspaceId,
      snippetId: item.snippetId,
      snippet,
      authorName:
        item.snippet.user?.name ||
        item.snippet.user?.email ||
        "Unknown",
    }
  })

  return (
    <main className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 flex-col">
        <WorkspaceHeader
          workspaceId={workspaceId}
          name={workspace.name}
          description={workspace.description}
          inviteCode={workspace.inviteCode}
          snippetsCount={workspace._count.snippets}
          membersCount={workspace._count.members}
          role={member.role}
          canEdit={canEdit}
        />

        {snippets.length > 0 ? (
          <WorkspaceSnippetPanel
            workspaceId={workspaceId}
            snippets={snippets}
            canEdit={canEdit}
          />
        ) : (
          <div className="m-4 flex flex-1 items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-center sm:m-6 sm:p-10">
            <h3 className="text-lg font-semibold mb-2">
              Belum ada note di workspace ini
            </h3>

            <p className="text-sm text-[var(--text3)] max-w-md mx-auto mb-5">
              Tambahkan note baru atau ambil dari library pribadi kamu.
            </p>

            {canEdit && (
              <div className="flex flex-col justify-center gap-2 sm:flex-row">
                <Link
                  href={`/workspaces/${workspaceId}?action=add-existing`}
                  className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text2)] hover:bg-[var(--surface2)] transition-all"
                >
                  Add Existing
                </Link>

                <Link
                  href={`/workspaces/${workspaceId}?action=new-snippet`}
                  className="px-4 py-2 rounded-lg bg-[var(--em)] text-[#0a0a0a] text-sm font-semibold hover:opacity-90 transition-all"
                >
                  New Note
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {action === "add-existing" && canEdit && (
        <AddExistingSnippetModal
          workspaceId={workspaceId}
          snippets={availableSnippets}
        />
      )}

      {action === "new-snippet" && canEdit && (
        <WorkspaceSnippetModal workspaceId={workspaceId} />
      )}
    </main>
  )
}
