"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { formatWorkspaceInviteCode } from "@/lib/workspaceInviteCode"

export default function JoinWorkspaceModal() {
  const router = useRouter()

  const [inviteCode, setInviteCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const close = () => {
    router.push("/workspaces")
  }

  const handleCodeChange = (value: string) => {
    const normalizedValue = value.trim().toUpperCase()

    if (/^DVNT-[A-Z0-9]{0,6}$/.test(normalizedValue)) {
      setInviteCode(normalizedValue)

      if (error) {
        setError("")
      }
      return
    }

    const rawCode = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 9)
    setInviteCode(formatWorkspaceInviteCode(rawCode))

    if (error) {
      setError("")
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")

    if (!inviteCode.trim()) {
      setError("Invite code wajib diisi")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/workspaces/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inviteCode: inviteCode.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Gagal gabung workspace")
        return
      }

      router.refresh()
      router.push(`/workspaces/${data.workspace.id}`)
    } catch {
      setError("Terjadi error saat gabung workspace")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={close}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Gabung Workspace</h2>
          <p className="text-sm text-[var(--text3)] mt-1">
            Masukkan invite code dari owner workspace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-[var(--text4)] mb-1 block">
              Invite code
            </label>
            <input
              autoFocus
              value={inviteCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="XXX-XXX-XXX"
              maxLength={11}
              autoComplete="off"
              spellCheck={false}
              className="w-full font-mono bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--em-border)]"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={close}
              className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text2)] hover:bg-[var(--surface2)]"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-[var(--em)] text-[#0a0a0a] text-sm font-semibold disabled:opacity-60"
            >
              {loading ? "Menggabungkan..." : "Gabung"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
