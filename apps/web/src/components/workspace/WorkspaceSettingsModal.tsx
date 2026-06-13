"use client"

import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faSpinner,
  faUserGroup,
  faXmark,
} from "@fortawesome/free-solid-svg-icons"
import WorkspaceRoleBadge from "./WorkspaceRoleBadge"

type WorkspaceRole = "OWNER" | "EDITOR" | "VIEWER"

interface WorkspaceMember {
  id: number
  role: WorkspaceRole
  user: {
    id: number
    name: string
    email: string
    avatar: string | null
  }
}

interface WorkspaceSettingsModalProps {
  workspaceId: number
  workspaceName: string
  onClose: () => void
}

export default function WorkspaceSettingsModal({
  workspaceId,
  workspaceName,
  onClose,
}: WorkspaceSettingsModalProps) {
  const [members, setMembers] = useState<WorkspaceMember[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const controller = new AbortController()

    fetch(`/api/workspaces/${workspaceId}/members`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Gagal memuat anggota workspace")
        }

        setMembers(data.members)
      })
      .catch((loadError) => {
        if (loadError instanceof DOMException && loadError.name === "AbortError") {
          return
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Gagal memuat anggota workspace"
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [workspaceId])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  const updateRole = async (
    memberId: number,
    role: "EDITOR" | "VIEWER"
  ) => {
    const previousMembers = members
    setUpdatingId(memberId)
    setError("")
    setMembers((current) =>
      current.map((member) =>
        member.id === memberId ? { ...member, role } : member
      )
    )

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memberId, role }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengubah role")
      }
    } catch (updateError) {
      setMembers(previousMembers)
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Gagal mengubah role"
      )
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="workspace-settings-title"
        className="flex max-h-[min(680px,calc(100dvh-32px))] w-full max-w-xl flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
          <div className="min-w-0">
            <h2
              id="workspace-settings-title"
              className="truncate text-base font-semibold"
            >
              Pengaturan {workspaceName}
            </h2>
            <p className="mt-1 text-xs text-[var(--text3)]">
              Atur akses anggota workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--text3)] transition-colors hover:bg-[var(--surface2)] hover:text-[var(--text)]"
            aria-label="Tutup pengaturan workspace"
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </header>

        <div className="min-h-0 overflow-y-auto p-5">
          <div className="mb-3 flex items-center gap-2">
            <FontAwesomeIcon
              icon={faUserGroup}
              className="h-3.5 w-3.5 text-[var(--em)]"
            />
            <h3 className="text-xs font-semibold uppercase tracking-[1.4px] text-[var(--text2)]">
              Anggota
            </h3>
            {!loading && (
              <span className="text-xs text-[var(--text4)]">
                {members.length}
              </span>
            )}
          </div>

          {error && (
            <p className="mb-3 rounded-md border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}

          {loading ? (
            <div className="flex min-h-40 items-center justify-center text-[var(--text3)]">
              <FontAwesomeIcon
                icon={faSpinner}
                spin
                className="h-4 w-4"
              />
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {members.map((member) => {
                const initials = member.user.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
                const isUpdating = updatingId === member.id

                return (
                  <div
                    key={member.id}
                    className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--em-border)] bg-[var(--em-soft)] text-xs font-semibold text-[var(--em)]"
                        aria-hidden="true"
                      >
                        {initials || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {member.user.name}
                        </p>
                        <p className="truncate text-xs text-[var(--text4)]">
                          {member.user.email}
                        </p>
                      </div>
                    </div>

                    {member.role === "OWNER" ? (
                      <WorkspaceRoleBadge role="OWNER" />
                    ) : (
                      <div
                        className="grid h-8 grid-cols-2 rounded-md border border-[var(--border)] bg-[var(--bg)] p-0.5"
                        aria-label={`Role ${member.user.name}`}
                      >
                        {(["VIEWER", "EDITOR"] as const).map((role) => (
                          <button
                            key={role}
                            type="button"
                            disabled={isUpdating}
                            onClick={() => void updateRole(member.id, role)}
                            className={`min-w-16 rounded px-2 text-[11px] font-medium transition-colors disabled:cursor-wait ${
                              member.role === role
                                ? "bg-[var(--em-soft)] text-[var(--em)]"
                                : "text-[var(--text4)] hover:text-[var(--text2)]"
                            }`}
                          >
                            {isUpdating && member.role === role ? (
                              <FontAwesomeIcon
                                icon={faSpinner}
                                spin
                                className="h-3 w-3"
                              />
                            ) : role === "VIEWER" ? (
                              "Viewer"
                            ) : (
                              "Editor"
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
