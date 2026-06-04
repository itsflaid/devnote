"use client"

import { useState } from "react"
import SnippetCard from "./SnippetCard"
import type { Snippet } from "./types"
import SnippetListHeader from "./SnippetListHeader"

interface SnippetExplorerProps<TItem> {
  title: string
  items: TItem[]
  getSnippet: (item: TItem) => Snippet
  getKey: (item: TItem) => string | number
  getAuthorName?: (item: TItem) => string | undefined
  listWidthClassName?: string
  renderDetail: (snippet: Snippet, item: TItem) => React.ReactNode
}

export default function SnippetExplorer<TItem>({
  title,
  items,
  getSnippet,
  getKey,
  getAuthorName,
  listWidthClassName = "w-[300px]",
  renderDetail,
}: SnippetExplorerProps<TItem>) {
  const [selectedId, setSelectedId] = useState<number | null>(
    items[0] ? getSnippet(items[0]).id : null
  )
  const [filterOpen, setFilterOpen] = useState(false)
  const [activeLang, setActiveLang] = useState<string | null>(null)

  const langCounts = items.reduce<Record<string, number>>((acc, item) => {
    const lang = getSnippet(item).language
    if (lang) acc[lang] = (acc[lang] ?? 0) + 1
    return acc
  }, {})

  const availableLangs = Object.entries(langCounts).sort((a, b) => b[1] - a[1])

  const visibleItems = activeLang
    ? items.filter((item) => getSnippet(item).language === activeLang)
    : items

  const selectedItem =
    visibleItems.find((item) => getSnippet(item).id === selectedId) ??
    visibleItems[0] ??
    null

  const selectedSnippet = selectedItem ? getSnippet(selectedItem) : null

  return (
    <div className="flex-1 min-h-0 overflow-hidden flex bg-[var(--surface)]">
      <aside
        className={`${listWidthClassName} shrink-0 border-r border-[var(--border)] flex flex-col min-h-0`}
      >
        <SnippetListHeader
          title={title}
          visibleCount={visibleItems.length}
          totalCount={items.length}
          activeLang={activeLang}
          filterOpen={filterOpen}
          availableLangs={availableLangs}
          onToggleFilter={() => setFilterOpen((prev) => !prev)}
          onToggleLang={(lang) =>
            setActiveLang((prev) => (prev === lang ? null : lang))
          }
        />

        <div className="flex-1 overflow-y-auto p-2">
          {visibleItems.map((item) => {
            const snippet = getSnippet(item)

            return (
              <SnippetCard
                key={getKey(item)}
                snippet={snippet}
                active={selectedSnippet?.id === snippet.id}
                authorName={getAuthorName?.(item)}
                onClick={() => setSelectedId(snippet.id)}
              />
            )
          })}

          {visibleItems.length === 0 && (
            <p className="text-[12px] text-[var(--text4)] text-center py-8">
              Tidak ada snippet dengan bahasa ini
            </p>
          )}
        </div>
      </aside>

      <section className="flex-1 min-w-0 min-h-0 flex flex-col">
        {selectedSnippet && selectedItem ? (
          renderDetail(selectedSnippet, selectedItem)
        ) : (
          <div className="flex-1 flex items-center justify-center text-[var(--text4)]">
            Pilih snippet dulu.
          </div>
        )}
      </section>
    </div>
  )
}
