import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Prefs {
    sortOrder: "newest" | "oldest" | "az" | "za"
    defaultLanguage: string
    listView: "comfortable" | "compact"
    codeTheme: string
    codeFontSize: "12" | "13" | "14"
    lineNumbers: boolean
}

interface AppStore {
    favCount: number
    setFavCount: (count: number) => void
    incrementFav: () => void
    decrementFav: () => void

    publicCount: number
    setPublicCount: (count: number) => void
    incrementPublicCount: () => void
    decrementPublicCount: () => void

    favoriteIds: Set<number>
    setFavoriteIds: (ids: number[]) => void
    toggleFavoriteId: (id: number) => void

    publicIds: Set<number>
    setPublicIds: (ids: number[]) => void
    togglePublicId: (id: number) => void

    isNavigating: boolean
    setIsNavigating: (val: boolean) => void

    prefs: Prefs
    updatePref: <K extends keyof Prefs>(key: K, val: Prefs[K]) => void
}

function syncSortCookie(value: string) {
    if (typeof document === "undefined") return
    document.cookie = `devnote-sort-order=${value}; path=/; max-age=31536000; SameSite=Lax`
}

const DEFAULT_PREFS: Prefs = {
    sortOrder: "newest",
    defaultLanguage: "typescript",
    listView: "comfortable",
    codeTheme: "one-dark-pro",
    codeFontSize: "13",
    lineNumbers: false,
}

export const useAppStore = create<AppStore>()(
    persist(
        (set) => ({
            favCount: 0,
            setFavCount: (count) => set({ favCount: count }),
            incrementFav: () => set((s) => ({ favCount: s.favCount + 1 })),
            decrementFav: () =>
                set((s) => ({ favCount: Math.max(0, s.favCount - 1) })),

            favoriteIds: new Set(),
            setFavoriteIds: (ids) => set({ favoriteIds: new Set(ids) }),
            toggleFavoriteId: (id) =>
                set((s) => {
                    const next = new Set(s.favoriteIds)
                    if (next.has(id)) next.delete(id)
                    else next.add(id)
                    return { favoriteIds: next }
                }),

            publicCount: 0,
            setPublicCount: (count) => set({ publicCount: count }),
            incrementPublicCount: () =>
                set((s) => ({ publicCount: s.publicCount + 1 })),
            decrementPublicCount: () =>
                set((s) => ({
                    publicCount: Math.max(0, s.publicCount - 1),
                })),

            publicIds: new Set(),
            setPublicIds: (ids) => set({ publicIds: new Set(ids) }),
            togglePublicId: (id) =>
                set((s) => {
                    const next = new Set(s.publicIds)
                    if (next.has(id)) next.delete(id)
                    else next.add(id)
                    return { publicIds: next }
                }),

            isNavigating: false,
            setIsNavigating: (val) => set({ isNavigating: val }),

            prefs: DEFAULT_PREFS,
            updatePref: (key, val) =>
                set((s) => {
                    if (key === "sortOrder") syncSortCookie(val as string)
                    return {
                        prefs: { ...s.prefs, [key]: val },
                    }
                }),
        }),
        {
            name: "devnote_store",
            partialize: (s) => ({
                prefs: s.prefs,
                favCount: s.favCount,
                publicCount: s.publicCount,
                
            }),
        }
    )
)
