"use client"

import Link from "next/link"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faChevronDown,
  faGear,
  faPlus,
} from "@fortawesome/free-solid-svg-icons"
import WorkspaceRoleBadge from "./WorkspaceRoleBadge"
import WorkspaceSettingsModal from "./WorkspaceSettingsModal"
import { formatWorkspaceInviteCode } from "@/lib/workspaceInviteCode"

interface WorkspaceHeaderProps {
  workspaceId: number
  name: string
  description: string | null
  inviteCode: string
  snippetsCount: number
  membersCount: number
  role: "OWNER" | "EDITOR" | "VIEWER"
  canEdit: boolean
}

export default function WorkspaceHeader({
  workspaceId,
  name,
  description,
  inviteCode,
  snippetsCount,
  membersCount,
  role,
  canEdit,
}: WorkspaceHeaderProps) {
  const [open, setOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <section className="shrink-0 border-b border-[var(--border)] bg-[var(--bg)]">
      <div className="flex items-center gap-2 px-3 py-2 sm:px-4">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--text3)] transition-all hover:bg-[var(--surface2)] hover:text-[var(--em)]"
          aria-label={open ? "Tutup detail workspace" : "Buka detail workspace"}
        >
          <FontAwesomeIcon
            icon={faChevronDown}
            className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        <h1 className="min-w-0 truncate text-[14px] font-semibold sm:text-[15px]">
          {name}
        </h1>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 sm:px-4 sm:pb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <WorkspaceRoleBadge role={role} />
                  <span className="text-[10px] font-semibold uppercase tracking-[1.6px] text-[var(--text4)]">
                    Private Workspace
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {canEdit && (
                    <>
                      <Link
                        href={`/workspaces/${workspaceId}?action=add-existing`}
                        className="rounded-lg border border-[var(--border)] px-3 py-2 text-[12px] text-[var(--text2)] transition-all hover:bg-[var(--surface2)]"
                      >
                        Add Existing
                      </Link>

                      <Link
                        href={`/workspaces/${workspaceId}?action=new-snippet`}
                        className="flex items-center justify-center gap-2 rounded-lg bg-[var(--em)] px-3 py-2 text-[12px] font-semibold text-[#0a0a0a] transition-all hover:opacity-90"
                      >
                        <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                        New Note
                      </Link>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => setSettingsOpen(true)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text3)] transition-all hover:bg-[var(--surface2)] hover:text-[var(--em)]"
                    aria-label="Pengaturan workspace"
                  >
                    <FontAwesomeIcon icon={faGear} className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <p className="mt-3 max-w-3xl text-[13px] text-[var(--text3)]">
                {description || "Tidak ada deskripsi workspace."}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs text-[var(--text3)]">
                  {snippetsCount} notes
                </span>
                <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs text-[var(--text3)]">
                  {membersCount} members
                </span>
                <span className="max-w-full truncate rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 font-mono text-xs text-[var(--em-dim)]">
                  {formatWorkspaceInviteCode(inviteCode)}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {settingsOpen && (
        <WorkspaceSettingsModal
          workspaceId={workspaceId}
          workspaceName={name}
          description={description}
          inviteCode={inviteCode}
          role={role}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </section>
  )
}
