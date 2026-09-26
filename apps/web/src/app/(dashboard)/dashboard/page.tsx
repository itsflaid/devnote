import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Suspense } from "react"

import SnippetList from "@/components/snippet/SnippetList"
import SavedLibraryView from "@/components/snippet/SavedLibraryView"
import type { Snippet } from "@/components/snippet/shared/types"

async function DashboardContent({
  searchParams,
}: {
  searchParams: Promise<{
    lang?: string
    tag?: string
    filter?: string
    collection?: string
    search?: string
  }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const params = await searchParams
  const { lang, tag, filter, collection, search } = params
  const userId = Number(session.user.id)

  const cookieStore = await cookies()
  const sortPref = cookieStore.get("devnote-sort-order")?.value

  const defaultOrderBy =
    sortPref === "oldest" ? { createdAt: "asc" as const } :
    sortPref === "az" ? { title: "asc" as const } :
    sortPref === "za" ? { title: "desc" as const } :
    { updatedAt: "desc" as const }

  if (filter === "saved") {
    const saved = await prisma.savedSnippet.findMany({
      where: {
        userId,
        ...(lang && { snippet: { language: lang } }),
        ...(tag && { snippet: { tags: { some: { tag: { name: tag } } } } }),
        ...(collection && { snippet: { collections: { some: { collectionId: Number(collection) } } } }),
      },
      include: {
        snippet: {
          include: {
            tags: { include: { tag: true } },
            workspaces: { include: { workspace: { select: { id: true, name: true } } } },
          },
        },
      },
      orderBy: { savedAt: "desc" },
    })

    const unavailableIds = saved
      .filter((s) => !s.snippet.isPublic && s.snippet.userId !== userId)
      .map((s) => ({ snippetId: s.snippetId, savedAt: s.savedAt.toISOString() }))

    const availableSnippets: Snippet[] = saved
      .filter((s) => s.snippet.isPublic || s.snippet.userId === userId)
      .map((s) => ({
        id: s.snippet.id,
        title: s.snippet.title,
        language: s.snippet.language,
        description: s.snippet.description ?? null,
        code: s.snippet.code,
        copyCount: s.snippet.copyCount,
        isFavorite: s.snippet.isFavorite,
        isPublic: s.snippet.isPublic,
        shareId: s.snippet.shareId ?? null,
        createdAt: s.snippet.createdAt.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        updatedAt: s.snippet.updatedAt.toISOString(),
        tags: s.snippet.tags.map((t) => t.tag.name),
        workspaces: s.snippet.workspaces.map((item) => ({
          id: item.workspace.id,
          name: item.workspace.name,
        })),
      }))

    return (
      <SavedLibraryView
        key={`saved-${lang ?? ""}-${tag ?? ""}-${collection ?? ""}`}
        snippets={availableSnippets}
        unavailable={unavailableIds}
      />
    )
  }

  const rawSnippets = await prisma.snippet.findMany({
    where: {
      userId,

      ...(lang && { language: lang }),

      ...(tag && {
        tags: {
          some: {
            tag: {
              name: tag,
            },
          },
        },
      }),

      ...(filter === "favorites" && {
        isFavorite: true,
      }),

      ...(filter === "public" && {
        isPublic: true,
      }),

      ...(filter === "workspace" && {
        workspaces: {
          some: {
            workspace: {
              members: {
                some: {
                  userId,
                },
              },
            },
          },
        },
      }),

      ...(collection && {
        collections: {
          some: {
            collectionId: Number(collection),
          },
        },
      }),

      ...(filter === "most-copied" && {
        copyCount: {
          gt: 0,
        },
      }),
    },

    orderBy:
      filter === "most-copied"
        ? {
            copyCount: "desc",
          }
        : defaultOrderBy,

    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      workspaces: {
        include: {
          workspace: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  })

  const snippets: Snippet[] = rawSnippets.map((s) => ({
    id: s.id,
    title: s.title,
    language: s.language,
    description: s.description ?? null,
    code: s.code,
    copyCount: s.copyCount,
    isFavorite: s.isFavorite,
    isPublic: s.isPublic,
    shareId: s.shareId ?? null,
    createdAt: s.createdAt.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    updatedAt: s.updatedAt.toISOString(),
    tags: s.tags.map((t) => t.tag.name),
    workspaces: s.workspaces.map((item) => ({
      id: item.workspace.id,
      name: item.workspace.name,
    })),
  }))

  return (
    <SnippetList
        key={`${filter ?? ""}-${lang ?? ""}-${tag ?? ""}-${collection ?? ""}`}
        snippets={snippets}
    />
  )
}

export default function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    lang?: string
    tag?: string
    filter?: string
    collection?: string
    search?: string
  }>
}) {
  return (
    <div className="h-full overflow-hidden">
      <Suspense
        fallback={
          <div className="flex h-[80vh] items-center justify-center">
            <div className="text-center">
              <p className="text-lg text-gray-500">Memuat daftar note...</p>
            </div>
          </div>
        }
      >
        <DashboardContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
