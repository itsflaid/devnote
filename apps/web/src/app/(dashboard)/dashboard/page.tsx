import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Prisma } from "@prisma/client"

import SnippetList from "@/components/snippet/SnippetList"
import { Snippet } from "@/components/snippet/SnippetDetail"

type RawSnippet = Prisma.SnippetGetPayload<{
  include: {
    tags: {
      include: {
        tag: true
      }
    }
  }
}>

async function DashboardContent({
  searchParams,
}: {
  searchParams: Promise<{
    lang?: string;
    tag?: string;
    filter?: string;
    collection?: string;
    search?: string
  }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const params = await searchParams
  const { lang, tag, filter, collection, search } = params

  const rawSnippets = await prisma.snippet.findMany({
    where: {
      userId: Number(session.user.id),
      ...(lang && { language: lang }),
      ...(tag && { tags: { some: { tag: { name: tag } } } }),
      ...(filter === "favorites" && { isFavorite: true }),
      ...(filter === "public" && { isPublic: true }),
      ...(collection && { collections: { some: { collectionId: Number(collection) } } }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { code: { contains: search } },
          { description: { contains: search } },
          { tags: { some: { tag: { name: { contains: search } } } } },
        ]
      }),
      ...(filter === "most-copied" && {
        copyCount: {
          gt: 0
        }
      }),
      ...(filter === "workspace" && {
        workspaces: {
          some: {
            workspace: {
              members: {
                some: {
                  userId: Number(session.user.id),
                },
              },
            },
          },
        },
      }),
    },
    orderBy: filter === "most-copied"
      ? { copyCount: "desc" }
      : { createdAt: "desc" },
    include: {
      tags: { include: { tag: true } }
    }
  })

  const snippets: Snippet[] = rawSnippets.map((s: RawSnippet) => ({
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
      year: "numeric"
    }),
    tags: s.tags.map((t) => t.tag.name)
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
    lang?: string;
    tag?: string;
    filter?: string;
    collection?: string;
    search?: string
  }>
}) {
  return (
    <div className="h-full overflow-hidden">
      <Suspense fallback={
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-gray-500">Memuat daftar snippet...Hidup jokowi!!!</p>
          </div>
        </div>
      }>
        <DashboardContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}