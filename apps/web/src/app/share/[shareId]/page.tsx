import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
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
            user: {
                select: {
                    name: true,
                    avatar: true,
                }
            },
            tags: {
                select: {
                    tag: { select: { name: true } }
                }
            }
        }
    })

    if (!snippet) notFound()

    const tags = snippet.tags.map(t => t.tag.name)

    return (
        <SharePageClient
            snippet={{
                ...snippet,
                tags,
                createdAt: snippet.createdAt.toISOString(),
            }}
        />
    )
}