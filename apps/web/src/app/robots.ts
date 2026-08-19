import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard', '/preferences', '/profile', '/workspaces', '/api'],
        },
        sitemap: 'https://devnote-five.vercel.app/sitemap.xml',
    }
}