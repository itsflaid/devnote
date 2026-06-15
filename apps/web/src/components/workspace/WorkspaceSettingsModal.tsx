"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCopy,
  faCrown,
  faFloppyDisk,
  faRightFromBracket,
  faRotate,
  faSpinner,
  faTrash,
  faUserGroup,
  faUserMinus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons"
import WorkspaceRoleBadge from "./WorkspaceRoleBadge"
import { formatWorkspaceInviteCode } from "@/lib/workspaceInviteCode"

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

type PendingAction =
  | { type: "remove"; member: WorkspaceMember }
  | { type: "transfer"; member: WorkspaceMember }
  | { type: "leave" }
  | { type: "delete" }
  | null

interface WorkspaceSettingsModalProps {
  workspaceId: number
  workspaceName: string
  description: string | null
  inviteCode: string
  role: WorkspaceRole
  onClose: () => void
}

export default function WorkspaceSettingsModal({
  workspaceId,
  workspaceName,
  description,
  inviteCode,
  role,
  onClose,
}: WorkspaceSettingsModalProps) {
  const router = useRouter()
  const isOwner = role === "OWNER"
  const [name, setName] = useState(workspaceName)
  const [workspaceDescription, setWorkspaceDescription] = useState(
    description ?? ""
  )
  const [currentInviteCode, setCurrentInviteCode] = useState(inviteCode)
  const [members, setMembers] = useState<WorkspaceMember[]>([])
  const [loadingMembers, setLoadingMembers] = useState(isOwner)
  const [savingDetails, setSavingDetails] = useState(false)
  const [regeneratingCode, setRegeneratingCode] = useState(false)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [processingAction, setProcessingAction] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  useEffect(() => {
    if (!isOwner) {
      return
    }

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
          setLoadingMembers(false)
        }
      })

    return () => controller.abort()
  }, [isOwner, workspaceId])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return
      }

      if (pendingAction) {
        setPendingAction(null)
        setDeleteConfirmation("")
        return
      }

      onClose()
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose, pendingAction])

  const resetFeedback = () => {
    setError("")
    setNotice("")
  }

  const saveDetails = async (event: FormEvent) => {
    event.preventDefault()
    resetFeedback()

    if (!name.trim()) {
      setError("Nama workspace wajib diisi")
      return
    }

    setSavingDetails(true)

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: workspaceDescription.trim(),
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Gagal menyimpan workspace")
      }

      setName(data.workspace.name)
      setWorkspaceDescription(data.workspace.description ?? "")
      setNotice("Detail workspace disimpan.")
      router.refresh()
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Gagal menyimpan workspace"
      )
    } finally {
      setSavingDetails(false)
    }
  }

  const regenerateInviteCode = async () => {
    resetFeedback()
    setRegeneratingCode(true)

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: "PATCH",
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Gagal membuat kode baru")
      }

      setCurrentInviteCode(data.inviteCode)
      setNotice("Kode undangan baru sudah aktif.")
      router.refresh()
    } catch (regenerateError) {
      setError(
        regenerateError instanceof Error
          ? regenerateError.message
          : "Gagal membuat kode baru"
      )
    } finally {
      setRegeneratingCode(false)
    }
  }

  const copyInviteCode = async () => {
    resetFeedback()

    try {
      await navigator.clipboard.writeText(
        formatWorkspaceInviteCode(currentInviteCode)
      )
      setNotice("Kode undangan disalin.")
    } catch {
      setError("Kode undangan gagal disalin")
    }
  }

  const updateRole = async (
    memberId: number,
    nextRole: "EDITOR" | "VIEWER"
  ) => {
    const previousMembers = members
    resetFeedback()
    setUpdatingId(memberId)
    setMembers((current) =>
      current.map((member) =>
        member.id === memberId ? { ...member, role: nextRole } : member
      )
    )

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, role: nextRole }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengubah role")
      }

      setNotice("Role anggota diperbarui.")
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

  const runPendingAction = async () => {
    if (!pendingAction) {
      return
    }

    resetFeedback()
    setProcessingAction(true)

    try {
      if (pendingAction.type === "remove") {
        const response = await fetch(
          `/api/workspaces/${workspaceId}/members`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ memberId: pendingAction.member.id }),
          }
        )
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Gagal mengeluarkan anggota")
        }

        setMembers((current) =>
          current.filter((member) => member.id !== pendingAction.member.id)
        )
        setNotice(`${pendingAction.member.user.name} dikeluarkan dari workspace.`)
        setPendingAction(null)
        router.refresh()
        return
      }

      if (pendingAction.type === "transfer") {
        const response = await fetch(
          `/api/workspaces/${workspaceId}/members`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ memberId: pendingAction.member.id }),
          }
        )
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Gagal memindahkan ownership")
        }

        setPendingAction(null)
        onClose()
        router.refresh()
        return
      }

      if (pendingAction.type === "leave") {
        const response = await fetch(
          `/api/workspaces/${workspaceId}/members`,
          { method: "DELETE" }
        )
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Gagal keluar dari workspace")
        }

        router.push("/workspaces")
        router.refresh()
        return
      }

      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: "DELETE",
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Gagal menghapus workspace")
      }

      router.push("/workspaces")
      router.refresh()
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Aksi workspace gagal"
      )
      setPendingAction(null)
      setDeleteConfirmation("")
    } finally {
      setProcessingAction(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 px-3 py-4 backdrop-blur-sm sm:px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="workspace-settings-title"
        className="relative flex max-h-[calc(100dvh-32px)] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-4 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <h2
              id="workspace-settings-title"
              className="truncate text-base font-semibold"
            >
              Pengaturan workspace
            </h2>
            <p className="mt-1 truncate text-xs text-[var(--text3)]">
              {name}
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

        <div className="min-h-0 overflow-y-auto">
          {(error || notice) && (
            <div className="border-b border-[var(--border)] px-4 py-3 sm:px-5">
              <p
                className={`rounded-md border px-3 py-2 text-xs ${
                  error
                    ? "border-red-500/25 bg-red-500/10 text-red-300"
                    : "border-[var(--em-border)] bg-[var(--em-soft)] text-[var(--em)]"
                }`}
              >
                {error || notice}
              </p>
            </div>
          )}

          {isOwner && (
            <>
              <section className="border-b border-[var(--border)] p-4 sm:p-5">
                <SectionHeading title="Detail workspace" />
                <form onSubmit={saveDetails} className="mt-4 space-y-3">
                  <label className="block">
                    <span className="mb-1.5 block text-xs text-[var(--text3)]">
                      Nama
                    </span>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--em-border)]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs text-[var(--text3)]">
                      Deskripsi
                    </span>
                    <textarea
                      value={workspaceDescription}
                      onChange={(event) =>
                        setWorkspaceDescription(event.target.value)
                      }
                      rows={3}
                      className="w-full resize-none rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--em-border)]"
                    />
                  </label>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingDetails}
                      className="flex h-9 items-center gap-2 rounded-md bg-[var(--em)] px-3 text-xs font-semibold text-[#0a0a0a] transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
                    >
                      <FontAwesomeIcon
                        icon={savingDetails ? faSpinner : faFloppyDisk}
                        spin={savingDetails}
                        className="h-3 w-3"
                      />
                      Simpan
                    </button>
                  </div>
                </form>
              </section>

              <section className="border-b border-[var(--border)] p-4 sm:p-5">
                <SectionHeading title="Kode undangan" />
                <p className="mt-2 text-xs leading-5 text-[var(--text4)]">
                  Membuat kode baru akan langsung menonaktifkan kode lama.
                </p>
                <div className="mt-3 flex min-w-0 flex-col gap-2 sm:flex-row">
                  <code className="min-w-0 flex-1 truncate rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 font-mono text-sm text-[var(--em)]">
                    {formatWorkspaceInviteCode(currentInviteCode)}
                  </code>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void copyInviteCode()}
                      className="flex h-9 flex-1 items-center justify-center gap-2 rounded-md border border-[var(--border)] px-3 text-xs text-[var(--text2)] transition-colors hover:bg-[var(--surface2)] sm:flex-none"
                    >
                      <FontAwesomeIcon icon={faCopy} className="h-3 w-3" />
                      Salin
                    </button>
                    <button
                      type="button"
                      disabled={regeneratingCode}
                      onClick={() => void regenerateInviteCode()}
                      className="flex h-9 flex-1 items-center justify-center gap-2 rounded-md border border-[var(--border)] px-3 text-xs text-[var(--text2)] transition-colors hover:bg-[var(--surface2)] disabled:cursor-wait disabled:opacity-60 sm:flex-none"
                    >
                      <FontAwesomeIcon
                        icon={regeneratingCode ? faSpinner : faRotate}
                        spin={regeneratingCode}
                        className="h-3 w-3"
                      />
                      Buat baru
                    </button>
                  </div>
                </div>
              </section>

              <section className="border-b border-[var(--border)] p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faUserGroup}
                    className="h-3.5 w-3.5 text-[var(--em)]"
                  />
                  <SectionHeading title="Anggota" />
                  {!loadingMembers && (
                    <span className="text-xs text-[var(--text4)]">
                      {members.length}
                    </span>
                  )}
                </div>

                {loadingMembers ? (
                  <div className="flex min-h-32 items-center justify-center text-[var(--text3)]">
                    <FontAwesomeIcon
                      icon={faSpinner}
                      spin
                      className="h-4 w-4"
                    />
                  </div>
                ) : (
                  <div className="mt-3 divide-y divide-[var(--border)] border-y border-[var(--border)]">
                    {members.map((member) => (
                      <MemberRow
                        key={member.id}
                        member={member}
                        updating={updatingId === member.id}
                        onRoleChange={(nextRole) =>
                          void updateRole(member.id, nextRole)
                        }
                        onRemove={() =>
                          setPendingAction({ type: "remove", member })
                        }
                        onTransfer={() =>
                          setPendingAction({ type: "transfer", member })
                        }
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          <section className="p-4 sm:p-5">
            <SectionHeading title={isOwner ? "Zona berbahaya" : "Keanggotaan"} />
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">
                  {isOwner ? "Hapus workspace" : "Keluar dari workspace"}
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--text4)]">
                  {isOwner
                    ? "Workspace dan seluruh relasinya akan dihapus permanen. Note asli tetap ada di library pemiliknya."
                    : "Kamu akan kehilangan akses ke seluruh note di workspace ini."}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setPendingAction({ type: isOwner ? "delete" : "leave" })
                }
                className="flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-red-500/35 px-3 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
              >
                <FontAwesomeIcon
                  icon={isOwner ? faTrash : faRightFromBracket}
                  className="h-3 w-3"
                />
                {isOwner ? "Hapus workspace" : "Keluar workspace"}
              </button>
            </div>
          </section>
        </div>

        {pendingAction && (
          <ConfirmationPanel
            action={pendingAction}
            workspaceName={name}
            confirmation={deleteConfirmation}
            processing={processingAction}
            onConfirmationChange={setDeleteConfirmation}
            onCancel={() => {
              setPendingAction(null)
              setDeleteConfirmation("")
            }}
            onConfirm={() => void runPendingAction()}
          />
        )}
      </div>
    </div>
  )
}

function SectionHeading({ title }: { title: string }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-[1.4px] text-[var(--text2)]">
      {title}
    </h3>
  )
}

function MemberRow({
  member,
  updating,
  onRoleChange,
  onRemove,
  onTransfer,
}: {
  member: WorkspaceMember
  updating: boolean
  onRoleChange: (role: "EDITOR" | "VIEWER") => void
  onRemove: () => void
  onTransfer: () => void
}) {
  const initials = member.user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--em-border)] bg-[var(--em-soft)] text-xs font-semibold text-[var(--em)]"
          aria-hidden="true"
        >
          {initials || "?"}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{member.user.name}</p>
          <p className="truncate text-xs text-[var(--text4)]">
            {member.user.email}
          </p>
        </div>
      </div>

      {member.role === "OWNER" ? (
        <WorkspaceRoleBadge role="OWNER" />
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="grid h-8 grid-cols-2 rounded-md border border-[var(--border)] bg-[var(--bg)] p-0.5"
            aria-label={`Role ${member.user.name}`}
          >
            {(["VIEWER", "EDITOR"] as const).map((nextRole) => (
              <button
                key={nextRole}
                type="button"
                disabled={updating}
                onClick={() => onRoleChange(nextRole)}
                className={`min-w-16 rounded px-2 text-[11px] font-medium transition-colors disabled:cursor-wait ${
                  member.role === nextRole
                    ? "bg-[var(--em-soft)] text-[var(--em)]"
                    : "text-[var(--text4)] hover:text-[var(--text2)]"
                }`}
              >
                {updating && member.role === nextRole ? (
                  <FontAwesomeIcon
                    icon={faSpinner}
                    spin
                    className="h-3 w-3"
                  />
                ) : nextRole === "VIEWER" ? (
                  "Viewer"
                ) : (
                  "Editor"
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onTransfer}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--text4)] transition-colors hover:bg-yellow-500/10 hover:text-yellow-300"
            aria-label={`Transfer ownership ke ${member.user.name}`}
            title="Transfer ownership"
          >
            <FontAwesomeIcon icon={faCrown} className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--text4)] transition-colors hover:bg-red-500/10 hover:text-red-400"
            aria-label={`Keluarkan ${member.user.name}`}
            title="Keluarkan anggota"
          >
            <FontAwesomeIcon icon={faUserMinus} className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

function ConfirmationPanel({
  action,
  workspaceName,
  confirmation,
  processing,
  onConfirmationChange,
  onCancel,
  onConfirm,
}: {
  action: Exclude<PendingAction, null>
  workspaceName: string
  confirmation: string
  processing: boolean
  onConfirmationChange: (value: string) => void
  onCancel: () => void
  onConfirm: () => void
}) {
  const copy = {
    remove: {
      title: "Keluarkan anggota?",
      description: `${action.type === "remove" ? action.member.user.name : ""} tidak akan bisa mengakses workspace ini lagi.`,
      button: "Keluarkan",
    },
    transfer: {
      title: "Transfer ownership?",
      description: `${action.type === "transfer" ? action.member.user.name : ""} akan menjadi Owner. Role kamu berubah menjadi Editor.`,
      button: "Transfer",
    },
    leave: {
      title: "Keluar dari workspace?",
      description: "Kamu perlu bergabung ulang dengan kode undangan untuk mendapat akses kembali.",
      button: "Keluar",
    },
    delete: {
      title: "Hapus workspace permanen?",
      description: "Tindakan ini tidak dapat dibatalkan.",
      button: "Hapus permanen",
    },
  }[action.type]
  const deleteReady =
    action.type !== "delete" || confirmation.trim() === workspaceName

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl">
        <h3 className="text-base font-semibold">{copy.title}</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--text3)]">
          {copy.description}
        </p>

        {action.type === "delete" && (
          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs text-[var(--text4)]">
              Ketik <strong className="text-[var(--text2)]">{workspaceName}</strong>{" "}
              untuk konfirmasi
            </span>
            <input
              autoFocus
              value={confirmation}
              onChange={(event) => onConfirmationChange(event.target.value)}
              className="w-full rounded-md border border-red-500/30 bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-red-400"
            />
          </label>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            disabled={processing}
            onClick={onCancel}
            className="h-9 rounded-md border border-[var(--border)] px-3 text-xs text-[var(--text2)] transition-colors hover:bg-[var(--surface2)] disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={processing || !deleteReady}
            onClick={onConfirm}
            className="flex h-9 items-center gap-2 rounded-md bg-red-500 px-3 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {processing && (
              <FontAwesomeIcon icon={faSpinner} spin className="h-3 w-3" />
            )}
            {copy.button}
          </button>
        </div>
      </div>
    </div>
  )
}
