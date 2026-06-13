"use client"

import { useState, useEffect } from "react"
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

  useEffect(() => {
    setIsNavigating(false)
  }, [snippets, setIsNavigating])

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
          items={snippets}
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
                visibleCount={snippets.length}
                totalCount={snippets.length}
                activeLang={null}
                filterOpen={false}
                availableLangs={[]}
                onToggleFilter={() => undefined}
                onToggleLang={() => undefined}
              />

              <div className="flex-1 overflow-y-auto p-2">
                {snippets.map((snippet) => (
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
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SnippetModal
        isOpen={modalOpen || !!editSnippet}
        onClose={handleModalClose}
        snippetToEdit={editSnippet}
      />
    </>
  )
}
