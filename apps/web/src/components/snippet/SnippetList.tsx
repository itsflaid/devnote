"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { type Snippet } from "./shared/types"
import SnippetDetail from "./shared/SnippetDetail"
import SnippetExplorer from "./shared/SnippetExplorer"
import SnippetListHeader from "./shared/SnippetListHeader"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCode, faPlus, faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import SnippetModal from "./SnippetModal"
import { AnimatePresence, motion } from "framer-motion"
import { useAppStore } from "@/lib/store"
import SnippetListSkeleton from "./SnippetListSkeleton"
import SnippetCard from "./shared/SnippetCard"

export default function SnippetList({ snippets }: { snippets: Snippet[] }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editSnippet, setEditSnippet] = useState<Snippet | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [mobileSelected, setMobileSelected] = useState<Snippet | null>(
    snippets[0] ?? null
  )

  const isNavigating = useAppStore((s) => s.isNavigating)
  const setIsNavigating = useAppStore((s) => s.setIsNavigating)

  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("search") ?? ""

  const filteredSnippets = useMemo(() => {
    if (!searchQuery.trim()) return snippets
    const q = searchQuery.trim().toLowerCase()
    return snippets.filter((s) => {
      if (s.title.toLowerCase().includes(q)) return true
      if (s.description?.toLowerCase().includes(q)) return true
      if (s.tags.some((t) => t.toLowerCase().includes(q))) return true
      return false
    })
  }, [snippets, searchQuery])

  useEffect(() => {
    setIsNavigating(false)
  }, [snippets, setIsNavigating])

  const knownSnippetIdsRef = useRef<Set<number>>(
    new Set(snippets.map((s) => s.id))
  )

  // Sama seperti di SnippetExplorer: tampilan mobile di komponen ini punya
  // state seleksi sendiri (`mobileSelected`), jadi perlu di-sync terpisah
  // supaya note baru langsung ke-select juga, bukan cuma di versi desktop.
  useEffect(() => {
    const currentIds = snippets.map((s) => s.id)
    const newSnippet = snippets.find((s) => !knownSnippetIdsRef.current.has(s.id))

    if (newSnippet) {
      setMobileSelected(newSnippet)
      setShowDetail(true)
    }

    knownSnippetIdsRef.current = new Set(currentIds)
  }, [snippets])

  if (isNavigating) return <SnippetListSkeleton />

  const handleModalClose = () => {
    setModalOpen(false)
    setEditSnippet(null)
  }

  if (snippets.length === 0) {
    return (
      <>
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-[56px] h-[56px] rounded-[12px] border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center text-[var(--text3)]">
              <FontAwesomeIcon icon={faCode} className="w-[22px] h-[22px]" />
            </div>

            <div>
              <p className="text-[15px] font-semibold text-[var(--text)] mb-1">
                Belum ada note
              </p>

              <p className="text-[13px] text-[var(--text3)]">
                Mulai simpan note pertamamu
              </p>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-[var(--em)] text-[#0a0a0a] font-semibold text-[13px] px-5 py-2.5 rounded-lg hover:bg-[#2bc48a] transition-all"
            >
              <FontAwesomeIcon icon={faPlus} className="w-[12px] h-[12px]" />
              Tambah Note
            </button>
          </div>
        </div>

        <SnippetModal
          key="create"
          isOpen={modalOpen}
          onClose={handleModalClose}
          snippetToEdit={null}
        />
      </>
    )
  }

  return (
    <>
      {/* desktop */}
      <div className="hidden lg:flex h-full overflow-hidden">
        <SnippetExplorer
          title="Semua Note"
          items={filteredSnippets}
          getSnippet={(snippet) => snippet}
          getKey={(snippet) => snippet.id}
          listWidthClassName="w-[330px]"
          renderDetail={(selected) => (
            <SnippetDetail
              key={selected.id}
              snippet={selected}
              onEdit={() => setEditSnippet(selected)}
            />
          )}
        />
      </div>

      {/* mobile tetap custom dulu */}
      <div className="flex lg:hidden h-full overflow-hidden relative">
        <AnimatePresence initial={false}>
          {!showDetail && (
            <motion.div
              key="list"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
              className="absolute inset-0 flex flex-col bg-[var(--bg2)]"
            >
              <SnippetListHeader
                title="Semua Note"
                visibleCount={filteredSnippets.length}
                totalCount={snippets.length}
                activeLang={null}
                filterOpen={false}
                availableLangs={[]}
                onToggleFilter={() => undefined}
                onToggleLang={() => undefined}
              />

              <div className="flex-1 overflow-y-auto p-2">
                {filteredSnippets.map((snippet) => (
                  <SnippetCard
                    key={snippet.id}
                    snippet={snippet}
                    active={mobileSelected?.id === snippet.id}
                    onClick={() => {
                      setMobileSelected(snippet)
                      setShowDetail(true)
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {showDetail && mobileSelected && (
            <motion.div
              key="detail"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
              className="absolute inset-0 flex flex-col bg-[var(--bg2)]"
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] shrink-0">
                <button
                  onClick={() => setShowDetail(false)}
                  className="flex items-center gap-2 text-[13px] text-[var(--text3)] hover:text-[var(--em)] transition-all"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="w-[12px] h-[12px]" />
                  Kembali
                </button>
              </div>

              <div className="flex-1 overflow-hidden">
                <SnippetDetail
                  key={mobileSelected.id}
                  snippet={mobileSelected}
                  onEdit={() => setEditSnippet(mobileSelected)}
                  onDeleted={() => setShowDetail(false)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SnippetModal
        key={editSnippet?.id ?? 'create'}
        isOpen={modalOpen || !!editSnippet}
        onClose={handleModalClose}
        snippetToEdit={editSnippet}
      />
    </>
  )
}