import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import SharePageClient from "./SharePageClient"

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