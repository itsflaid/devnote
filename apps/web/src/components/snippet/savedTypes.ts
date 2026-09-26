import type { Snippet } from "./shared/types"

export interface SavedOwner {
  id: number
  name: string
  avatar: string | null
}

export interface SavedLibraryItem {
  snippet: Snippet
  owner: SavedOwner
  isOwner: boolean
  likeCount: number
  likedByMe: boolean
  saveCount: number
  savedAt: string
  createdAtISO: string
}

export interface SavedUnavailableItem {
  snippetId: number
  savedAt: string
}
