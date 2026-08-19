import { MetadataRoute } from 'next'
import { prisma } from "@/lib/prisma"

const BASE_URL = 'https://devnote-five.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const publicSnippets = await prisma.snippet.findMany({
        where: { isPublic: true },
        select: { shareId: true, updatedAt: true },
    })

    const shareUrls: MetadataRoute.Sitemap = publicSnippets
        .filter((s) => s.shareId)
        .map((s) => ({
            url: `${BASE_URL}/share/${s.shareId}`,
            lastModified: s.updatedAt,
            changeFrequency: "weekly",
            priority: 0.7,
        }))

    return [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1,
        },
        {
            url: `${BASE_URL}/explore`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/login`,
            changeFrequency: 'yearly',
            priority: 0.4,
        },
        {
            url: `${BASE_URL}/register`,
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/join`,
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        ...shareUrls,
    ]
}