"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { trpc } from "@/lib/trpc"

interface RemoveWorkspaceSnippetButtonProps {
  workspaceId: number
  snippetId: number
  variant?: "desktop" | "mobile"
}

export default function RemoveWorkspaceSnippetButton({
  workspaceId,
  snippetId,
  variant = "desktop",
}: RemoveWorkspaceSnippetButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const removeMutation = trpc.workspace.snippets.remove.useMutation()

  const removeSnippet = async () => {
    const ok = window.confirm(
      "Remove note dari workspace ini? Note asli tetap ada di library owner."
    )

    if (!ok) return

    setLoading(true)

    try {
      await removeMutation.mutateAsync({ workspaceId, snippetId })
      router.refresh()
    } catch {
      alert("Gagal remove note dari workspace")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={removeSnippet}
      disabled={loading}
      className={
        variant === "mobile"
          ? "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] text-red-700 transition-all hover:bg-red-500/10 hover:text-red-400 disabled:opacity-60"
          : "rounded-lg border border-[var(--border2)] px-4 py-2 text-[13px] font-medium text-red-700 transition-all hover:border-red-500/60 hover:text-red-400 disabled:opacity-60"
      }
    >
      {loading ? "Removing..." : "Remove from workspace"}
    </button>
  )
}
