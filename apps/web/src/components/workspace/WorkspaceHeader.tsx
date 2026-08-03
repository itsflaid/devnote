"use client"

import Link from "next/link"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faChevronDown,
  faGear,
  faPlus,
  faCopy,
  faCheck,
} from "@fortawesome/free-solid-svg-icons"
import WorkspaceSettingsModal from "./WorkspaceSettingsModal"
import { formatWorkspaceInviteCode } from "@/lib/workspaceInviteCode"
import { timeAgo, getInitials } from "@/lib/format"

interface WorkspaceHeaderProps {
  workspaceId: number
  name: string
  description: string | null
  inviteCode: string
  snippetsCount: number
  membersCount: number
  memberNames: string[]
  updatedAt: string
  role: "OWNER" | "EDITOR" | "VIEWER"
  canEdit: boolean
}

const roleLabel = {
  OWNER: "Owner",
  EDITOR: "Editor",
  VIEWER: "Viewer",
}

export default function WorkspaceHeader({
  workspaceId,
  name,
  description,
  inviteCode,
  snippetsCount,
  membersCount,
  memberNames,
  updatedAt,
  role,
  canEdit,
}: WorkspaceHeaderProps) {
  const [open, setOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(formatWorkspaceInviteCode(inviteCode))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const overflowCount = membersCount - memberNames.length

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
              {/* Identitas: role + kapan diupdate, teks polos */}
              <div className="text-[11px] font-mono">
                <span className={role === "VIEWER" ? "text-[var(--text4)]" : "text-[var(--em)]"}>
                  {roleLabel[role]}
                </span>
                <span className="text-[var(--text4)]"> · diupdate {timeAgo(updatedAt)}</span>
              </div>

              {/* Deskripsi */}
              <p className="mt-2 max-w-3xl text-[13px] text-[var(--text3)]">
                {description || "Tidak ada deskripsi workspace."}
              </p>

              {/* Member avatar stack + stats + invite code */}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center -space-x-2">
                    {memberNames.map((memberName, i) => (
                      <div
                        key={i}
                        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--bg)] bg-gradient-to-br from-[var(--em-dim)] to-[var(--em)] text-[9px] font-bold text-[#0a0a0a]"
                      >
                        {getInitials(memberName)}
                      </div>
                    ))}
                    {overflowCount > 0 && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--bg)] bg-[var(--surface3)] text-[9px] font-semibold text-[var(--text3)]">
                        +{overflowCount}
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-[var(--text4)]">
                    {membersCount} members
                  </span>
                </div>

                <span className="text-[11px] font-mono text-[var(--text4)]">
                  {snippetsCount} notes
                </span>

                <button
                  onClick={handleCopyInvite}
                  className="flex items-center gap-1.5 rounded-md border border-[var(--border2)] bg-[var(--surface)] px-2.5 py-1 font-mono text-[11px] text-[var(--text3)] transition-all hover:border-[var(--em-border)] hover:text-[var(--em)]"
                >
                  {formatWorkspaceInviteCode(inviteCode)}
                  <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="h-[10px] w-[10px]" />
                </button>
              </div>

              {/* Aksi — paling bawah */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {canEdit && (
                  <>
                    <Link
                      href={`/workspaces/${workspaceId}?action=new-snippet`}
                      className="flex items-center justify-center gap-2 rounded-lg bg-[var(--em)] px-3 py-2 text-[12px] font-semibold text-[#0a0a0a] transition-all hover:opacity-90"
                    >
                      <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                      New Note
                    </Link>

                    <Link
                      href={`/workspaces/${workspaceId}?action=add-existing`}
                      className="px-3 py-2 text-[12px] text-[var(--text3)] transition-all hover:text-[var(--em)]"
                    >
                      Add Existing
                    </Link>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text3)] transition-all hover:bg-[var(--surface2)] hover:text-[var(--em)]"
                  aria-label="Pengaturan workspace"
                >
                  <FontAwesomeIcon icon={faGear} className="h-3.5 w-3.5" />
                </button>
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