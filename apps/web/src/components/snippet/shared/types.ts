export interface Snippet {
    id: number
    title: string
    language: string
    description: string | null
    code: string
    tags: string[]
    copyCount: number
    isFavorite?: boolean
    isPublic?: boolean
    createdAt: string
    shareId?: string | null
}
