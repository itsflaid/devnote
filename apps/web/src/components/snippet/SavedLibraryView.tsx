"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import SnippetList from "./SnippetList"
import type { Snippet } from "./shared/types"

interface UnavailableItem {
  snippetId: number
  savedAt: string
}

export default function SavedLibraryView({
  snippets,
  unavailable,
}: {
  snippets: Snippet[]
  unavailable: UnavailableItem[]
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const unsave = useMutation({
    mutationFn: (snippetId: number) =>
      fetch(`/api/snippets/${snippetId}/save`, { method: "POST" }).then((r) => r.json()),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sidebar"] })
      router.refresh()
    },
  })

  if (snippets.length === 0 && unavailable.length === 0) {
    return <SnippetList snippets={[]} />
  }

  return (
    <div className="h-full overflow-y-auto">
      {unavailable.length > 0 && (
        <div className="space-y-2 p-4 pb-0">
          {unavailable.map((item) => (
            <div
              key={item.snippetId}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 opacity-60"
            >
              <p className="text-sm text-[var(--text3)]">
                Note ini sudah tidak tersedia (dihapus atau dijadikan privat oleh pemiliknya)
              </p>
              <button
                onClick={() => unsave.mutate(item.snippetId)}
                disabled={unsave.isPending}
                className="mt-2 text-xs text-red-400 underline disabled:opacity-40"
              >
                Hapus dari Library
              </button>
            </div>
          ))}
        </div>
      )}
      <SnippetList snippets={snippets} />
    </div>
  )
}
