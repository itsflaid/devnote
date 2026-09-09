import { Metadata } from "next"
import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import ExploreClient from "./ExploreClient"

export const metadata: Metadata = {
    title: "Explore — DevNote",
    description: "Temukan dan bagikan note kode publik dari developer di seluruh dunia.",
}

async function getInitialExploreData() {
    const [rawSnippets, total] = await Promise.all([
        prisma.snippet.findMany({
            where: { isPublic: true },
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
                tags: { include: { tag: true } },
                user: { select: { id: true, name: true, avatar: true } },
                _count: { select: { likes: true } },
            },
        }),
        prisma.snippet.count({ where: { isPublic: true } }),
    ])

    const snippets = rawSnippets.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        code: s.code,
        language: s.language,
        copyCount: s.copyCount,
        createdAt: s.createdAt,
        tags: s.tags.map((t) => t.tag.name),
        user: s.user,
        likeCount: s._count.likes,
        likedByMe: false,
    }))

    return { snippets, total, page: 1, totalPages: Math.ceil(total / 5) }
}

export default async function ExplorePage() {
    const initialData = await getInitialExploreData()

    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-[var(--em)] border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <ExploreClient initialData={initialData} />
        </Suspense>
    )
}
