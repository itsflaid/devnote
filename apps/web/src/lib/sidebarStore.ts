// lib/store/sidebarStore.ts
import { create } from 'zustand'

type CollapsedState = {
    library: boolean
    collections: boolean
    languages: boolean
    tags: boolean
    workspaces: boolean
}

interface SidebarStore {
    collapsed: CollapsedState
    toggle: (key: keyof CollapsedState) => void
    setCollapsed: (newState: Partial<CollapsedState>) => void
    resetToDefault: () => void
}

export const useSidebarStore = create<SidebarStore>((set) => ({
    collapsed: {
        library: false,     // terbuka
        collections: true,  // tertutup
        languages: true,    // tertutup
        tags: true,         // tertutup
        workspaces: true,  // terttp
    },

    toggle: (key) =>
        set((state) => ({
            collapsed: {
                ...state.collapsed,
                [key]: !state.collapsed[key],
            },
        })),

    setCollapsed: (newState) =>
        set((state) => ({
            collapsed: { ...state.collapsed, ...newState },
        })),

    resetToDefault: () =>
        set({
            collapsed: {
                library: false,
                collections: true,
                languages: true,
                tags: true,
                workspaces: false,
            },
        }),
}))
