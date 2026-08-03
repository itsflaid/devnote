"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import LibrarySection from "./LibrarySection"
import CollectionSection from "./CollectionSection"
import WorkspaceSection from "./WorkspaceSection"
import TagSection from "./TagSection"
import ExploreSection from "./ExploreSection"
import StatsSection from "./StatsSection"

interface WorkspaceNavItem {
  id: number
  name: string
  role: "OWNER" | "EDITOR" | "VIEWER"
  snippetsCount: number
}

interface SidebarClientProps {
  totalSnippets: number
  totalCopies: number
  totalFavorites: number
  totalPublic: number
  workspaceSnippetsCount: number
  workspaces: WorkspaceNavItem[]
  tags: { name: string; count: number }[]
  onNavigate?: () => void
}

export default function SidebarClient({
  totalSnippets,
  totalCopies,
  totalFavorites,
  totalPublic,
  workspaceSnippetsCount,
  workspaces,
  tags,
  onNavigate,
}: SidebarClientProps) {
  const [sidebarWidth, setSidebarWidth] = useState(260)
  const isResizing = useRef(false)

  const startResizing = useCallback(() => {
    isResizing.current = true
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
  }, [])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return

      const newWidth = e.clientX
      if (newWidth >= 170 && newWidth <= 420) {
        setSidebarWidth(newWidth)
      }
    }

    const onMouseUp = () => {
      if (!isResizing.current) return

      isResizing.current = false
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)

    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [])

  return (
    <aside
      style={{ width: sidebarWidth }}
      className="dashboard-sidebar relative flex flex-col h-full bg-[var(--surface)] border-r border-[var(--border)] overflow-y-auto shrink-0"
    >
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
      <LibrarySection
        totalSnippets={totalSnippets}
        totalFavorites={totalFavorites}
        totalPublic={totalPublic}
        workspaceSnippetsCount={workspaceSnippetsCount}
        onNavigate={onNavigate}
      />

      <CollectionSection onNavigate={onNavigate} />

      <TagSection tags={tags} onNavigate={onNavigate} />

      <WorkspaceSection workspaces={workspaces} onNavigate={onNavigate} />

      <ExploreSection onNavigate={onNavigate} />

      <StatsSection
        totalSnippets={totalSnippets}
        totalCopies={totalCopies}
        totalTags={tags.length}
      />
      </div>

      <div
        onMouseDown={startResizing}
        className="absolute top-0 right-0 w-[4px] h-full cursor-col-resize z-50 group"
      >
        <div className="w-full h-full bg-transparent group-hover:bg-[var(--em-dim)] transition-colors duration-150" />
      </div>
    </aside>
  )
}
