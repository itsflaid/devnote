"use client"

import { useState, createContext, useContext, Suspense } from "react"
import Topbar from "@/components/layout/Topbar"
import SnippetModal from "@/components/snippet/SnippetModal"

export const SidebarContext = createContext<{
    sidebarOpen: boolean
    setSidebarOpen: (value: boolean) => void
}>({
    sidebarOpen: false,
    setSidebarOpen: () => {}
})

export function useSidebar() {
    return useContext(SidebarContext)
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [modalOpen, setModalOpen] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
            <Suspense fallback={<div className="h-[64px] border-b border-[var(--border)] bg-[var(--surface)]" />}>
                <Topbar
                    onNewSnippet={() => setModalOpen(true)}
                    onToggleSidebar={() => setSidebarOpen(prev => !prev)}
                />
            </Suspense>
            {children}
            <SnippetModal key="create" isOpen={modalOpen} onClose={() => setModalOpen(false)} />
        </SidebarContext.Provider>
    )
}
