"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"
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
  const [showMobileDetail, setShowMobileDetail] = useState(false)
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
    <div className="flex-1 min-h-0 overflow-hidden bg-[var(--bg)]">
      <div className="hidden lg:flex h-full min-h-0">
      <aside
        className={`${listWidthClassName} shrink-0 border-r border-[var(--border)] bg-[#0d0f0e] flex flex-col min-h-0`}
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

        <div className="flex-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const snippet = getSnippet(item)

            return (
              <SnippetCard
                key={getKey(item)}
                snippet={snippet}
                active={selectedSnippet?.id === snippet.id}
                authorName={getAuthorName?.(item)}
                onClick={() => {
                  setSelectedId(snippet.id)
                  setShowMobileDetail(true)
                }}
              />
            )
          })}

          {visibleItems.length === 0 && (
            <p className="text-[12px] text-[var(--text4)] text-center py-8">
              Tidak ada note dengan bahasa ini
            </p>
          )}
        </div>
      </aside>

      <section className="flex-1 min-w-0 min-h-0 flex flex-col">
        {selectedSnippet && selectedItem ? (
          renderDetail(selectedSnippet, selectedItem)
        ) : (
          <div className="flex-1 flex items-center justify-center text-[var(--text4)]">
            Pilih note dulu.
          </div>
        )}
      </section>
      </div>

      <div className="lg:hidden relative h-full min-h-0 overflow-hidden">
        <AnimatePresence initial={false}>
          {!showMobileDetail && (
            <motion.div
              key="list"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
              className="absolute inset-0 flex flex-col bg-[var(--surface)]"
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
                      onClick={() => {
                        setSelectedId(snippet.id)
                        setShowMobileDetail(true)
                      }}
                    />
                  )
                })}

                {visibleItems.length === 0 && (
                  <p className="text-[12px] text-[var(--text4)] text-center py-8">
                    Tidak ada note dengan bahasa ini
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {showMobileDetail && selectedSnippet && selectedItem && (
            <motion.div
              key="detail"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
              className="absolute inset-0 flex flex-col bg-[var(--surface)]"
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] shrink-0">
                <button
                  onClick={() => setShowMobileDetail(false)}
                  className="flex items-center gap-2 text-[13px] text-[var(--text3)] hover:text-[var(--em)] transition-all"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="w-[12px] h-[12px]" />
                  Kembali
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-hidden">
                {renderDetail(selectedSnippet, selectedItem)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
