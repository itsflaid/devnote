"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faLayerGroup,
  faPlus,
  faUserPlus,
  faUsers,
} from "@fortawesome/free-solid-svg-icons"

import { useSidebarStore } from "@/lib/sidebarStore"
import SidebarSection from "./SidebarSection"

interface WorkspaceNavItem {
  id: number
  name: string
  role: "OWNER" | "EDITOR" | "VIEWER"
  snippetsCount: number
}

interface WorkspaceSectionProps {
  workspaces: WorkspaceNavItem[]
  onNavigate?: () => void
}

export default function WorkspaceSection({
  workspaces = [],
  onNavigate,
}: WorkspaceSectionProps) {
  const router = useRouter()
  const pathname = usePathname()

  const { collapsed, toggle } = useSidebarStore()

  useEffect(() => {
    router.prefetch("/workspaces")
    router.prefetch("/workspaces?action=create")
    router.prefetch("/workspaces?action=join")

    workspaces.forEach((workspace) => {
      router.prefetch(`/workspaces/${workspace.id}`)
    })
  }, [router, workspaces])

  const isAllWorkspaces = pathname === "/workspaces"

  return (
    <SidebarSection
      title="Workspaces"
      open={!collapsed.workspaces}
      onToggle={() => toggle("workspaces")}
    >
      <div
        onClick={() => {
          router.push("/workspaces")
          onNavigate?.()
        }}
        className={`flex items-center justify-between px-2 py-[6px] rounded-[5px] cursor-pointer text-[13px] transition-all mb-0.5
        ${
          isAllWorkspaces
            ? "bg-[var(--em-faint)] text-[var(--em)] font-medium"
            : "text-[var(--text2)] hover:bg-[var(--em-faint)] hover:text-[var(--text)]"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <FontAwesomeIcon
            icon={faLayerGroup}
            className={`w-[12px] h-[12px] shrink-0 ${
              isAllWorkspaces ? "text-[var(--em)]" : "text-[var(--text4)]"
            }`}
          />
          <span>All Workspaces</span>
        </div>

        <span
          className={`font-mono text-[10px] px-2 py-[1px] rounded-full shrink-0
          ${
            isAllWorkspaces
              ? "text-[var(--em-dim)] bg-[var(--em-faint)]"
              : "text-[var(--text4)] bg-[var(--surface3)]"
          }`}
        >
          {workspaces.length}
        </span>
      </div>

      <div
        onClick={() => {
          router.push("/workspaces?action=create")
          onNavigate?.()
        }}
        className="flex items-center gap-2 px-2 py-[6px] rounded-[5px] cursor-pointer text-[13px] text-[var(--text4)] hover:bg-[var(--em-faint)] hover:text-[var(--em)] transition-all mb-0.5"
      >
        <FontAwesomeIcon icon={faPlus} className="w-[12px] h-[12px] shrink-0" />
        <span>Buat workspace</span>
      </div>

      <div
        onClick={() => {
          router.push("/workspaces?action=join")
          onNavigate?.()
        }}
        className="flex items-center gap-2 px-2 py-[6px] rounded-[5px] cursor-pointer text-[13px] text-[var(--text4)] hover:bg-[var(--em-faint)] hover:text-[var(--em)] transition-all mb-0.5"
      >
        <FontAwesomeIcon icon={faUserPlus} className="w-[12px] h-[12px] shrink-0" />
        <span>Gabung workspace</span>
      </div>

      <div className="overflow-y-auto max-h-[130px]">
        {workspaces.length === 0 && (
          <p className="text-[11px] text-[var(--text4)] px-2 py-1">
            Belum ada workspace
          </p>
        )}

        {workspaces.map((workspace) => {
          const active = pathname === `/workspaces/${workspace.id}`

          return (
            <div
              key={workspace.id}
              onClick={() => {
                router.push(`/workspaces/${workspace.id}`)
                onNavigate?.()
              }}
              onPointerEnter={() => router.prefetch(`/workspaces/${workspace.id}`)}
              className={`flex items-center justify-between px-2 py-[6px] rounded-[5px] cursor-pointer text-[13px] transition-all
              ${
                active
                  ? "bg-[var(--em-faint)] text-[var(--em)] font-medium"
                  : "text-[var(--text2)] hover:bg-[var(--em-faint)] hover:text-[var(--text)]"
              }`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FontAwesomeIcon
                  icon={faUsers}
                  className={`w-[12px] h-[12px] shrink-0 ${
                    active ? "text-[var(--em)]" : "text-[var(--text4)]"
                  }`}
                />
                <span className="truncate">{workspace.name}</span>
              </div>

              <span
                className={`font-mono text-[10px] px-2 py-[1px] rounded-full shrink-0
                ${
                  active
                    ? "text-[var(--em-dim)] bg-[var(--em-faint)]"
                    : "text-[var(--text4)] bg-[var(--surface3)]"
                }`}
              >
                {workspace.snippetsCount}
              </span>
            </div>
          )
        })}
      </div>
    </SidebarSection>
  )
}
