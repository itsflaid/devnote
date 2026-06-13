"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface AvailableSnippet {
  id: number
  title: string
  language: string
  description: string | null
}

interface AddExistingSnippetModalProps {
  workspaceId: number
  snippets: AvailableSnippet[]
}

export default function AddExistingSnippetModal({
  workspaceId,
  snippets,
}: AddExistingSnippetModalProps) {
  const router = useRouter()

  const [search, setSearch] = useState("")
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [error, setError] = useState("")

  const close = () => {
    router.push(`/workspaces/${workspaceId}`)
  }

  const filtered = snippets.filter((snippet) => {
    const q = search.toLowerCase()

    return (
      snippet.title.toLowerCase().includes(q) ||
      snippet.language.toLowerCase().includes(q) ||
      snippet.description?.toLowerCase().includes(q)
    )
  })

  const addSnippet = async (snippetId: number) => {
    setError("")
    setLoadingId(snippetId)

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/snippets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ snippetId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Gagal menambahkan note")
        return
      }

      router.refresh()
      router.push(`/workspaces/${workspaceId}`)
    } catch {
      setError("Terjadi error saat menambahkan note")
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={close}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Add Existing Note</h2>
          <p className="text-sm text-[var(--text3)] mt-1">
            Ambil note dari library kamu dan masukkan ke workspace ini.
          </p>
        </div>

        <input
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari note..."
          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--em-border)] mb-3"
        />

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-3">
            {error}
          </p>
        )}

        <div className="max-h-[360px] overflow-y-auto space-y-2">
          {filtered.length > 0 ? (
            filtered.map((snippet) => (
              <div
                key={snippet.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3"
              >
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold truncate">
                    {snippet.title}
                  </h3>
                  <p className="text-xs text-[var(--text4)] mt-1 line-clamp-1">
                    {snippet.description || "Tidak ada deskripsi"}
                  </p>
                  <span className="inline-block mt-2 text-[10px] uppercase tracking-[1px] px-2 py-1 rounded-full border border-[var(--border)] text-[var(--text3)]">
                    {snippet.language}
                  </span>
                </div>

                <button
                  onClick={() => addSnippet(snippet.id)}
                  disabled={loadingId === snippet.id}
                  className="px-3 py-2 rounded-lg bg-[var(--em)] text-[#0a0a0a] text-xs font-semibold disabled:opacity-60 shrink-0"
                >
                  {loadingId === snippet.id ? "Adding..." : "Add"}
                </button>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center">
              <p className="text-sm text-[var(--text3)]">
                Tidak ada note yang bisa ditambahkan.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={close}
            className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text2)] hover:bg-[var(--surface2)]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
