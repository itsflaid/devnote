import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import SharePageClient from "./SharePageClient"

export async function generateMetadata({
    params,
}: {
    params: Promise<{ shareId: string }>
}): Promise<Metadata> {
    const { shareId } = await params

    const snippet = await prisma.snippet.findUnique({
        where: { shareId },
        select: {
            title: true,
            description: true,
            language: true,
        },
    })

    if (!snippet) return {}

    const title = `${snippet.title} — Note Kode di DevNote`
    const description =
        snippet.description ??
        `Note kode ${snippet.language} yang dibagikan di DevNote — code snippet manager gratis untuk developer.`

    return {
        title,
        description,
        alternates: {
            canonical: `/share/${shareId}`,
        },
        openGraph: {
            title,
            description,
            type: "article",
            url: `/share/${shareId}`,
            images: [
                {
                    url: "/og-image.png",
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
    }
}

export default async function SharePage({
    params,
}: {
    params: Promise<{ shareId: string }>
}) {
    const { shareId } = await params

    const session = await auth()
    const userId = session?.user?.id ? Number(session.user.id) : null

    const snippet = await prisma.snippet.findUnique({
        where: { shareId },
        select: {
            id: true,
            title: true,
            description: true,
            code: true,
            language: true,
            isPublic: true,
            copyCount: true,
            createdAt: true,
            userId: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                }
            },
            tags: {
                select: {
                    tag: { select: { name: true } }
                }
            },
            _count: { select: { likes: true, savedBy: true } },
        }
    })

    if (!snippet) notFound()

    const tags = snippet.tags.map(t => t.tag.name)
    const isOwner = userId != null && snippet.userId === userId
    const [likedByMe, savedByMe] = userId != null
        ? await Promise.all([
            prisma.like.findUnique({
                where: { userId_snippetId: { userId, snippetId: snippet.id } },
            }).then((r) => !!r),
            prisma.savedSnippet.findUnique({
                where: { userId_snippetId: { userId, snippetId: snippet.id } },
            }).then((r) => !!r),
        ])
        : [false, false]

    return (
        <SharePageClient
            snippet={{
                ...snippet,
                tags,
                createdAt: snippet.createdAt.toISOString(),
                likeCount: snippet._count.likes,
                likedByMe,
                saveCount: snippet._count.savedBy,
                savedByMe,
                isOwner,
            }}
        />
    )
}