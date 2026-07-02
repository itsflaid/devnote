"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faEllipsis,
  faFolder,
  faPen,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons"

import { useAppStore } from "@/lib/store"
import { useSidebarStore } from "@/lib/sidebarStore"
import { trpc } from "@/lib/trpc"
import SidebarSection from "./SidebarSection"

interface Collection {
  id: number
  name: string
  _count: { snippets: number }
}

interface CollectionSectionProps {
  onNavigate?: () => void
}

export default function CollectionSection({ onNavigate }: CollectionSectionProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const { setIsNavigating } = useAppStore()
  const { collapsed, toggle } = useSidebarStore()

  const activeCollection = searchParams.get("collection")

  const createCollection = trpc.collection.create.useMutation()
  const renameCollection = trpc.collection.rename.useMutation()
  const deleteCollection = trpc.collection.delete.useMutation()
  const { data: collectionsData } = trpc.collection.list.useQuery()

  const [collections, setCollections] = useState<Collection[]>([])
  useEffect(() => {
    if (collectionsData) {
      setCollections(collectionsData as Collection[])
    }
  }, [collectionsData])

  const [newColName, setNewColName] = useState("")
  const [addingCol, setAddingCol] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState("")
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null)
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    collections.forEach((col) => {
      router.prefetch(`/dashboard?collection=${col.id}`)
    })
  }, [router, collections])

  const setCollectionFilter = (id: number) => {
    setIsNavigating(true)

    startTransition(() => {
      router.replace(`/dashboard?collection=${id}`)
    })

    onNavigate?.()
  }

  const handleAddCollection = async () => {
    if (!newColName.trim()) return

    const data = await createCollection.mutateAsync({ name: newColName.trim() })

    setCollections((prev) => [{ ...data, _count: { snippets: 0 } }, ...prev])
    setNewColName("")
    setAddingCol(false)
  }

  const handleRename = async (id: number) => {
    if (!editingName.trim()) return

    await renameCollection.mutateAsync({ id, name: editingName.trim() })

    setCollections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: editingName.trim() } : c))
    )
    setEditingId(null)
    setEditingName("")
  }

  const handleDelete = async (id: number) => {
    await deleteCollection.mutateAsync({ id })

    setCollections((prev) => prev.filter((c) => c.id !== id))
    setMenuOpenId(null)

    if (activeCollection === String(id)) router.replace("/dashboard")
  }

  return (
    <>
      <SidebarSection
        title="Collections"
        open={!collapsed.collections}
        onToggle={() => toggle("collections")}
      >
        {addingCol ? (
          <div className="flex flex-col gap-1.5 px-2 py-1 mb-1">
            <input
              autoFocus
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddCollection()
                if (e.key === "Escape") {
                  setAddingCol(false)
                  setNewColName("")
                }
              }}
              placeholder="Nama collection..."
              className="w-full bg-[var(--bg)] border border-[var(--em-border)] rounded-md px-2 py-[5px] text-[12px] text-[var(--text)] outline-none placeholder:text-[var(--text4)]"
            />

            <div className="flex gap-1.5">
              <button
                onClick={handleAddCollection}
                className="flex-1 text-[11px] bg-[var(--em)] text-[#0a0a0a] font-semibold py-[5px] rounded-md hover:bg-[#2bc48a] transition-all"
              >
                Simpan
              </button>

              <button
                onClick={() => {
                  setAddingCol(false)
                  setNewColName("")
                }}
                className="flex-1 text-[11px] text-[var(--text1)] py-[5px] rounded-md hover:bg-[var(--surface2)] transition-all"
              >
                Batal
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setAddingCol(true)}
            className="flex items-center gap-2 px-2 py-[6px] rounded-[5px] cursor-pointer text-[13px] text-[var(--text4)] hover:bg-[var(--em-faint)] hover:text-[var(--em)] transition-all mb-0.5"
          >
            <FontAwesomeIcon icon={faPlus} className="w-[12px] h-[12px] shrink-0" />
            <span>Buat collection</span>
          </div>
        )}

        <div className="overflow-y-auto max-h-[125px]">
          {collections.length === 0 && (
            <p className="text-[11px] text-[var(--text4)] px-2 py-1 italic">
              Belum ada collection
            </p>
          )}

          {collections.map((col) => (
            <div key={col.id} className="relative group">
              {editingId === col.id ? (
                <div className="flex items-center gap-1.5 px-2 py-1">
                  <input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(col.id)
                      if (e.key === "Escape") setEditingId(null)
                    }}
                    className="flex-1 bg-[var(--bg)] border border-[var(--em-border)] rounded-md px-2 py-[4px] text-[12px] text-[var(--text)] outline-none"
                  />

                  <button
                    onClick={() => handleRename(col.id)}
                    className="text-[11px] text-[var(--em)] font-medium px-2 py-[4px] rounded-md hover:bg-[var(--em-faint)] transition-all"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setCollectionFilter(col.id)}
                  onPointerEnter={() => router.prefetch(`/dashboard?collection=${col.id}`)}
                  onTouchStart={() => router.prefetch(`/dashboard?collection=${col.id}`)}
                  className={`flex items-center justify-between px-2 py-[6px] rounded-[5px] cursor-pointer text-[13px] transition-all
                  ${
                    activeCollection === String(col.id)
                      ? "bg-[var(--em-faint)] text-[var(--em)] font-medium"
                      : "text-[var(--text2)] hover:bg-[var(--em-faint)] hover:text-[var(--text)]"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FontAwesomeIcon
                      icon={faFolder}
                      className={`w-[12px] h-[12px] shrink-0 ${
                        activeCollection === String(col.id)
                          ? "text-[var(--em)]"
                          : "text-[var(--text4)]"
                      }`}
                    />
                    <span className="truncate">{col.name}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className={`font-mono text-[10px] px-2 py-[1px] rounded-full
                      ${
                        activeCollection === String(col.id)
                          ? "text-[var(--em-dim)] bg-[var(--em-faint)]"
                          : "text-[var(--text4)] bg-[var(--surface3)]"
                      }`}
                    >
                      {col._count.snippets}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        const rect = e.currentTarget.getBoundingClientRect()
                        setMenuPos({ x: rect.right, y: rect.bottom + 4 })
                        setMenuOpenId(col.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 w-[18px] h-[18px] flex items-center justify-center rounded text-[var(--text4)] hover:text-[var(--text)] transition-all"
                    >
                      <FontAwesomeIcon icon={faEllipsis} className="w-[10px] h-[10px]" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </SidebarSection>

      {menuOpenId !== null && menuPos && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setMenuOpenId(null)
              setMenuPos(null)
            }}
          />

          <div
            className="fixed z-50 w-[140px] rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-xl p-1"
            style={{ top: menuPos.y, left: menuPos.x - 140 }}
          >
            <button
              onClick={() => {
                const col = collections.find((c) => c.id === menuOpenId)
                if (col) {
                  setEditingId(col.id)
                  setEditingName(col.name)
                }

                setMenuOpenId(null)
                setMenuPos(null)
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-[12px] text-[var(--text2)] hover:bg-[var(--surface2)] rounded-md transition-all"
            >
              <FontAwesomeIcon icon={faPen} className="w-[10px] h-[10px]" />
              Rename
            </button>

            <button
              onClick={() => handleDelete(menuOpenId)}
              className="flex items-center gap-2 w-full px-3 py-2 text-[12px] text-red-400 hover:bg-red-500/10 rounded-md transition-all"
            >
              <FontAwesomeIcon icon={faTrash} className="w-[10px] h-[10px]" />
              Hapus
            </button>
          </div>
        </>
      )}
    </>
  )
}
