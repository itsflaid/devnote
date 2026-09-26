"use client"

import { useState } from "react"
import Link from "next/link"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import SnippetExplorer from "./shared/SnippetExplorer"
import SnippetDetail from "./shared/SnippetDetail"
import SnippetModal from "./SnippetModal"
import SavedSnippetDetail from "./SavedSnippetDetail"
import type { Snippet } from "./shared/types"
import type { SavedLibraryItem, SavedUnavailableItem } from "./savedTypes"

export type { SavedLibraryItem, SavedUnavailableItem } from "./savedTypes"

export default function SavedLibraryView({
  items: initialItems,
  unavailable,
}: {
  items: SavedLibraryItem[]
  unavailable: SavedUnavailableItem[]
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [items, setItems] = useState<SavedLibraryItem[]>(initialItems)
  const [editSnippet, setEditSnippet] = useState<Snippet | null>(null)

  const unsaveUnavailable = useMutation({
    mutationFn: (snippetId: number) =>
      fetch(`/api/snippets/${snippetId}/save`, { method: "POST" }).then((r) => r.json()),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sidebar"] })
      router.refresh()
    },
  })

  const handleUnsave = (snippetId: number) => {
    setItems((prev) => prev.filter((it) => it.snippet.id !== snippetId))
    queryClient.invalidateQueries({ queryKey: ["sidebar"] })
  }

  const handleDeleted = (snippetId: number) => {
    setItems((prev) => prev.filter((it) => it.snippet.id !== snippetId))
    queryClient.invalidateQueries({ queryKey: ["sidebar"] })
    router.refresh()
  }

  const patchSnippet = (snippet: Snippet) => {
    setItems((prev) =>
      prev.map((it) => (it.snippet.id === snippet.id ? { ...it, snippet } : it)),
    )
  }

  const handleModalClose = () => {
    setEditSnippet(null)
  }

  if (items.length === 0 && unavailable.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <p className="text-[15px] font-semibold text-[var(--text)]">
            Belum ada note yang disimpan.
          </p>
          <p className="text-[13px] text-[var(--text3)]">
            Simpan note publik orang lain lewat tombol bookmark di Explore.
          </p>
          <Link
            href="/explore"
            className="text-sm font-medium text-[var(--em)] underline underline-offset-4"
          >
            Jelajahi note publik
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {unavailable.length > 0 && (
        <div className="shrink-0 max-h-[38%] overflow-y-auto space-y-2 p-4 pb-0">
          {unavailable.map((item) => (
            <div
              key={item.snippetId}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 opacity-60"
            >
              <p className="text-sm text-[var(--text3)]">
                Note ini sudah tidak tersedia (dihapus atau dijadikan privat oleh
                pemiliknya)
              </p>
              <button
                onClick={() => unsaveUnavailable.mutate(item.snippetId)}
                disabled={unsaveUnavailable.isPending}
                className="mt-2 text-xs text-red-400 underline disabled:opacity-40"
              >
                Hapus dari Library
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden">
        <SnippetExplorer
          title="Saved Notes"
          items={items}
          getSnippet={(item) => item.snippet}
          getKey={(item) => item.snippet.id}
          getAuthorName={(item) => (item.isOwner ? undefined : item.owner.name)}
          listWidthClassName="w-[330px]"
          renderDetail={(snippet, item) =>
            item.isOwner ? (
              <SnippetDetail
                key={snippet.id}
                snippet={snippet}
                onEdit={() => setEditSnippet(snippet)}
                onDeleted={() => handleDeleted(snippet.id)}
              />
            ) : (
              <SavedSnippetDetail key={snippet.id} item={item} onUnsave={handleUnsave} />
            )
          }
        />
      </div>

      <SnippetModal
        key={editSnippet?.id ?? "closed"}
        isOpen={!!editSnippet}
        onClose={handleModalClose}
        snippetToEdit={editSnippet}
        onUpdated={patchSnippet}
      />
    </div>
  )
}
