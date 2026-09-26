"use client"

import { useEffect, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface SaveResponse {
  isSaved: boolean
  saveCount: number
}

export default function SaveButton({
  snippetId,
  initialSaved,
  initialCount = 0,
}: {
  snippetId: number
  initialSaved: boolean
  initialCount?: number
}) {
  const { data: session } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isSaved, setIsSaved] = useState(initialSaved)
  const [saveCount, setSaveCount] = useState(initialCount)

  useEffect(() => {
    setIsSaved(initialSaved)
  }, [initialSaved])

  useEffect(() => {
    setSaveCount(initialCount)
  }, [initialCount])

  const toggleSave = useMutation({
    mutationFn: () =>
      fetch(`/api/snippets/${snippetId}/save`, { method: "POST" }).then((r) => {
        if (!r.ok) throw new Error("save failed")
        return r.json() as Promise<SaveResponse>
      }),
    onMutate: () => {
      setIsSaved((prev) => !prev)
      setSaveCount((prev) => (isSaved ? Math.max(0, prev - 1) : prev + 1))
    },
    onError: () => {
      setIsSaved((prev) => !prev)
      setSaveCount((prev) => (isSaved ? prev + 1 : Math.max(0, prev - 1)))
    },
    onSuccess: (data) => {
      setIsSaved(data.isSaved)
      setSaveCount(data.saveCount)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["explore"] })
      queryClient.invalidateQueries({ queryKey: ["sidebar"] })
      queryClient.invalidateQueries({ queryKey: ["saved"] })
      queryClient.invalidateQueries({ queryKey: ["snippets", "saved"] })
    },
  })

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!session?.user) {
      router.push("/login")
      return
    }
    if (toggleSave.isPending) return
    toggleSave.mutate()
  }

  return (
    <button
      onClick={handleClick}
      aria-label={isSaved ? "Hapus dari saved" : "Simpan note"}
      title={isSaved ? "Hapus dari saved" : "Simpan note"}
      className={`flex items-center gap-1.5 text-[12px] transition-all px-2 py-1 rounded-lg ${
        isSaved
          ? "text-yellow-400 bg-yellow-400/10"
          : "text-[var(--text3)] hover:text-yellow-400 hover:bg-yellow-400/10"
      }`}
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill={isSaved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      <span className="font-mono">{saveCount}</span>
    </button>
  )
}
