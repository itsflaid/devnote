"use client"

import { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useSidebar } from "./DashboardLayout"
import SidebarClient from "./sidebar/SidebarClient"
import { trpc } from "@/lib/trpc"
import type { SidebarData } from "@/server/services/sidebarData"

interface MobileSidebarProps {
    initialSidebarData?: SidebarData
}

export default function MobileSidebar({ initialSidebarData }: MobileSidebarProps) {
    const { sidebarOpen, setSidebarOpen } = useSidebar()
    const { data: sidebarData } = trpc.sidebar.get.useQuery(undefined, {
        enabled: sidebarOpen,
        initialData: initialSidebarData,
        staleTime: 30_000,
    })

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSidebarOpen(false)
        }

        document.addEventListener("keydown", handleKey)
        return () => document.removeEventListener("keydown", handleKey)
    }, [setSidebarOpen])

    return (
        <AnimatePresence>
            {sidebarOpen && (
                <>
                    <motion.div
                        key="overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />

                    <motion.div
                        key="drawer"
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed left-0 top-0 h-full z-50 lg:hidden"
                        style={{ width: "280px" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {sidebarData ? (
                            <SidebarClient
                                totalSnippets={sidebarData.totalSnippets}
                                totalCopies={sidebarData.totalCopies}
                                totalFavorites={sidebarData.totalFavorites}
                                totalPublic={sidebarData.totalPublic}
                                workspaceSnippetsCount={sidebarData.workspaceSnippetsCount}
                                workspaces={sidebarData.workspaces}
                                tags={sidebarData.tags}
                                onNavigate={() => setSidebarOpen(false)}
                            />
                        ) : (
                            <aside className="w-full h-full bg-[var(--surface)] border-r border-[var(--border)] flex flex-col gap-3 p-4">
                                {[80, 60, 90, 50, 70].map((w, i) => (
                                    <div
                                        key={i}
                                        className="h-[28px] rounded-[5px] animate-pulse bg-[var(--surface2)]"
                                        style={{ width: `${w}%` }}
                                    />
                                ))}
                            </aside>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}