"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { type Snippet } from "./shared/types"
import SnippetDetail from "./shared/SnippetDetail"
import SnippetExplorer from "./shared/SnippetExplorer"
import SnippetListHeader from "./shared/SnippetListHeader"
import EmptyState from "./shared/EmptyState"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCode,
  faArrowLeft,
  faStar,
  faGlobe,
  faUsers,
  faCopy,
  faFolder,
  faTag,
} from "@fortawesome/free-solid-svg-icons"
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core"
import SnippetModal from "./SnippetModal"
import { AnimatePresence, motion } from "framer-motion"
import { useAppStore } from "@/lib/store"
import SnippetListSkeleton from "./SnippetListSkeleton"
import SnippetCard from "./shared/SnippetCard"

interface CollectionOption {
  id: number
  name: string
}

interface ViewConfig {
  headerLabel: string
  icon: IconDefinition
  emptyTitle: string
  emptySubtitle: string
  showAddCta: boolean
}

function buildViewConfig({
  filter,
  collectionId,
  collectionName,
  tag,
  lang,
}: {
  filter: string | null
  collectionId: string | null
  collectionName: string | undefined
  tag: string | null
  lang: string | null
}): ViewConfig {
  if (collectionId) {
    const name = collectionName ?? null
    return {
      headerLabel: name ? `Koleksi: ${name}` : "Koleksi",
      icon: faFolder,
      emptyTitle: name
        ? `Belum ada note di koleksi "${name}"`
        : "Belum ada note di koleksi ini",
      emptySubtitle: "Tambahkan note ke koleksi ini dari halaman detail note",
      showAddCta: false,
    }
  }

  if (tag) {
    return {
      headerLabel: `Tag: ${tag}`,
      icon: faTag,
      emptyTitle: `Belum ada note dengan tag "${tag}"`,
      emptySubtitle:
        "Note dengan tag ini bakal muncul di sini begitu kamu tambahkan tag-nya",
      showAddCta: false,
    }
  }

  if (filter === "favorites") {
    return {
      headerLabel: "Favorites",
      icon: faStar,
      emptyTitle: "Belum ada favorite",
      emptySubtitle:
        "Tandai note yang sering kamu pakai dengan ikon bintang di halaman detail note",
      showAddCta: false,
    }
  }

  if (filter === "public") {
    return {
      headerLabel: "Public",
      icon: faGlobe,
      emptyTitle: "Belum ada note public",
      emptySubtitle:
        "Jadikan salah satu notemu public dari halaman detail biar bisa dilihat orang lain",
      showAddCta: false,
    }
  }

  if (filter === "workspace") {
    return {
      headerLabel: "Workspace Notes",
      icon: faUsers,
      emptyTitle: "Belum ada note dari workspace",
      emptySubtitle:
        "Note yang ditambahkan di workspace yang kamu ikuti bakal muncul di sini",
      showAddCta: false,
    }
  }

  if (filter === "most-copied") {
    return {
      headerLabel: "Paling Banyak Dicopy",
      icon: faCopy,
      emptyTitle: "Belum ada note yang di-copy",
      emptySubtitle: "Note yang paling banyak di-copy bakal muncul di sini",
      showAddCta: false,
    }
  }

  if (lang) {
    return {
      headerLabel: `Bahasa: ${lang}`,
      icon: faCode,
      emptyTitle: `Belum ada note dengan bahasa "${lang}"`,
      emptySubtitle: "Note dengan bahasa ini bakal muncul di sini",
      showAddCta: false,
    }
  }

  return {
    headerLabel: "Semua Note",
    icon: faCode,
    emptyTitle: "Belum ada note",
    emptySubtitle: "Mulai simpan note pertamamu",
    showAddCta: true,
  }
}

export default function SnippetList({ snippets }: { snippets: Snippet[] }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editSnippet, setEditSnippet] = useState<Snippet | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [localSnippets, setLocalSnippets] = useState<Snippet[]>(snippets)
  const [mobileSelectedId, setMobileSelectedId] = useState<number | null>(
    snippets[0]?.id ?? null
  )

  const isNavigating = useAppStore((s) => s.isNavigating)
  const setIsNavigating = useAppStore((s) => s.setIsNavigating)
  const sortOrder = useAppStore((s) => s.prefs.sortOrder)

  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("search") ?? ""
  const filterParam = searchParams.get("filter")
  const collectionParam = searchParams.get("collection")
  const tagParam = searchParams.get("tag")
  const langParam = searchParams.get("lang")

  // Reuse cache "collections" yang sama kayak yang dipakai CollectionSection
  // di sidebar, biar gak nambah network call baru cuma buat ambil nama
  // koleksi aktif.
  const { data: collectionsData } = useQuery<CollectionOption[]>({
    queryKey: ["collections"],
    queryFn: () => fetch("/api/collections").then((r) => r.json()),
    enabled: !!collectionParam,
  })

  const collectionName = collectionsData?.find(
    (c) => String(c.id) === collectionParam
  )?.name

  const viewConfig = useMemo(
    () =>
      buildViewConfig({
        filter: filterParam,
        collectionId: collectionParam,
        collectionName,
        tag: tagParam,
        lang: langParam,
      }),
    [filterParam, collectionParam, collectionName, tagParam, langParam]
  )

  // Sinkronkan state lokal dengan data server setiap props berubah
  // (router.refresh / navigasi). Mutation edit/delete di-patch langsung
  // di state lokal ini biar UI responsif tanpa nunggu round-trip server.
  const [prevSnippets, setPrevSnippets] = useState(snippets)
  if (prevSnippets !== snippets) {
    setPrevSnippets(snippets)
    setLocalSnippets(snippets)
  }

  const filteredSnippets = useMemo(() => {
    if (!searchQuery.trim()) return localSnippets
    const q = searchQuery.trim().toLowerCase()
    return localSnippets.filter((s) => {
      if (s.title.toLowerCase().includes(q)) return true
      if (s.description?.toLowerCase().includes(q)) return true
      if (s.tags.some((t) => t.toLowerCase().includes(q))) return true
      return false
    })
  }, [localSnippets, searchQuery])

  const [filterOpen, setFilterOpen] = useState(false)
  const [activeLang, setActiveLang] = useState<string | null>(null)

  const langCounts = filteredSnippets.reduce<Record<string, number>>((acc, s) => {
    const lang = s.language
    if (lang) acc[lang] = (acc[lang] ?? 0) + 1
    return acc
  }, {})

  const availableLangs = Object.entries(langCounts).sort((a, b) => b[1] - a[1])

  const mobileVisibleSnippets = useMemo(
    () => (activeLang ? filteredSnippets.filter((s) => s.language === activeLang) : filteredSnippets),
    [filteredSnippets, activeLang]
  )

  const mobileSelected = useMemo(
    () => mobileVisibleSnippets.find((s) => s.id === mobileSelectedId) ?? mobileVisibleSnippets[0] ?? null,
    [mobileVisibleSnippets, mobileSelectedId]
  )

  useEffect(() => {
    setIsNavigating(false)
  }, [snippets, setIsNavigating])

  const knownSnippetIdsRef = useRef<Set<number>>(
    new Set(snippets.map((s) => s.id))
  )

  // Sama seperti di SnippetExplorer: tampilan mobile di komponen ini punya
  // state seleksi sendiri (`mobileSelectedId`), jadi perlu di-sync terpisah
  // supaya note baru langsung ke-select juga, bukan cuma di versi desktop.
  useEffect(() => {
    const currentIds = snippets.map((s) => s.id)
    const newSnippet = snippets.find((s) => !knownSnippetIdsRef.current.has(s.id))

    if (newSnippet) {
      setMobileSelectedId(newSnippet.id)
      setShowDetail(true)
    }

    knownSnippetIdsRef.current = new Set(currentIds)
  }, [snippets])

  const resort = (list: Snippet[], order: string) => {
    if (order === "az") return [...list].sort((a, b) => a.title.localeCompare(b.title))
    if (order === "za") return [...list].sort((a, b) => b.title.localeCompare(a.title))
    if (order === "oldest") return list
    return [...list].sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))
  }

  const patchSnippet = (snippet: Snippet) => {
    setLocalSnippets((prev) => resort(prev.map((s) => (s.id === snippet.id ? snippet : s)), sortOrder))
  }

  const handleDeleted = (id: number) => {
    setLocalSnippets((prev) => prev.filter((s) => s.id !== id))
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setEditSnippet(null)
  }

  if (isNavigating) return <SnippetListSkeleton />

  if (localSnippets.length === 0) {
    return (
      <>
        <EmptyState
          icon={viewConfig.icon}
          title={viewConfig.emptyTitle}
          subtitle={viewConfig.emptySubtitle}
          action={
            viewConfig.showAddCta
              ? {
                  type: "button",
                  label: "Tambah Note",
                  onClick: () => setModalOpen(true),
                }
              : { type: "link", label: "Lihat Semua Note", href: "/dashboard" }
          }
        />

        <SnippetModal
          key="create"
          isOpen={modalOpen}
          onClose={handleModalClose}
          snippetToEdit={null}
          onUpdated={patchSnippet}
        />
      </>
    )
  }

  return (
    <>
      {/* desktop */}
      <div className="hidden lg:flex h-full overflow-hidden">
        <SnippetExplorer
          title={viewConfig.headerLabel}
          items={filteredSnippets}
          getSnippet={(snippet) => snippet}
          getKey={(snippet) => snippet.id}
          listWidthClassName="w-[330px]"
          emptyFilterMessage={
            searchQuery.trim()
              ? `Tidak ada note yang cocok dengan pencarian "${searchQuery.trim()}"`
              : "Tidak ada note yang cocok"
          }
          renderDetail={(selected) => (
            <SnippetDetail
              key={selected.id}
              snippet={selected}
              onEdit={() => setEditSnippet(selected)}
              onDeleted={() => handleDeleted(selected.id)}
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
                title={viewConfig.headerLabel}
                visibleCount={mobileVisibleSnippets.length}
                totalCount={filteredSnippets.length}
                activeLang={activeLang}
                filterOpen={filterOpen}
                availableLangs={availableLangs}
                onToggleFilter={() => setFilterOpen((prev) => !prev)}
                onToggleLang={(lang) =>
                  setActiveLang((prev) => (prev === lang ? null : lang))
                }
              />

              <div className="flex-1 overflow-y-auto p-2">
                {mobileVisibleSnippets.map((snippet) => (
                  <SnippetCard
                    key={snippet.id}
                    snippet={snippet}
                    active={mobileSelected?.id === snippet.id}
                    onClick={() => {
                      setMobileSelectedId(snippet.id)
                      setShowDetail(true)
                    }}
                  />
                ))}

                {mobileVisibleSnippets.length === 0 && (
                  <p className="text-[12px] text-[var(--text4)] text-center py-8">
                    {searchQuery.trim()
                      ? `Tidak ada note yang cocok dengan pencarian "${searchQuery.trim()}"`
                      : activeLang
                      ? "Tidak ada note dengan bahasa ini"
                      : "Tidak ada note yang cocok"}
                  </p>
                )}
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
                  onDeleted={() => {
                    handleDeleted(mobileSelected.id)
                    setShowDetail(false)
                  }}
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
        onUpdated={patchSnippet}
      />
    </>
  )
}
