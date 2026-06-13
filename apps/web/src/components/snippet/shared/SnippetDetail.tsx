"use client"
import { useState, useEffect, useRef, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import CopyButton from "./CopyButton"
import CodeBlock from "./CodeBlock"
import MarkdownViewer from "./MarkdownViewer"
import type { Snippet } from "./types"
import { getLang } from "@/lib/languages"
import { useAppStore } from "@/lib/store"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFolderPlus, faCheck, faCopy, faLink, faLinkSlash, faEllipsisVertical, faCode, faEye } from "@fortawesome/free-solid-svg-icons"

interface SnippetDetailProps {
    snippet: Snippet
    onEdit: () => void
    canEdit?: boolean
    canDelete?: boolean
    canManageCollections?: boolean
    showPersonalControls?: boolean
    renderAdditionalActions?: (variant: "desktop" | "mobile") => ReactNode
}

interface Collection {
    id: number
    name: string
}

export default function SnippetDetail({
    snippet,
    onEdit,
    canEdit = true,
    canDelete = true,
    canManageCollections = true,
    showPersonalControls = true,
    renderAdditionalActions,
}: SnippetDetailProps) {
    const router = useRouter()
    const {
        incrementFav,
        decrementFav,
        toggleFavoriteId,
        favoriteIds,
        incrementPublicCount,
        decrementPublicCount,
        togglePublicId,
        publicIds,
    } = useAppStore()

    const [deleting, setDeleting] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [copyCount, setCopyCount] = useState(snippet.copyCount)
    const [isFavorite, setIsFavorite] = useState(snippet.isFavorite)
    const [isPublic, setIsPublic] = useState(snippet.isPublic)

    const [colOpen, setColOpen] = useState(false)
    const [collections, setCollections] = useState<Collection[]>([])
    const [assignedIds, setAssignedIds] = useState<number[]>([])
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    const [shareOpen, setShareOpen] = useState(false)
    const [shareId, setShareId] = useState<string | null>(snippet.shareId ?? null)
    const [shareLoading, setShareLoading] = useState(false)
    const [urlCopied, setUrlCopied] = useState(false)
    const [codeCopied, setCodeCopied] = useState(false)
    const [markdownMode, setMarkdownMode] = useState<"raw" | "preview">("raw")

    const colRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false)
            }
        }
        document.addEventListener("click", handleClickOutside)
        return () => document.removeEventListener("click", handleClickOutside)
    }, [])

    useEffect(() => {
        setCopyCount(snippet.copyCount)
    }, [snippet.id, snippet.copyCount])

    useEffect(() => {
        setIsFavorite(favoriteIds.has(snippet.id))
    }, [snippet.id, favoriteIds])

    useEffect(() => {
        setIsPublic(publicIds.has(snippet.id))
    }, [snippet.id, publicIds])

    useEffect(() => {
        setShareOpen(false)
        setShareId(snippet.shareId ?? null)
        setCodeCopied(false)
        setUrlCopied(false)
    }, [snippet.id, snippet.shareId])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (colRef.current && !colRef.current.contains(event.target as Node)) {
                setColOpen(false)
            }
        }
        document.addEventListener("click", handleClickOutside)
        return () => document.removeEventListener("click", handleClickOutside)
    }, [])

    useEffect(() => {
        if (!colOpen) return
        Promise.all([
            fetch("/api/collections").then(r => r.json()),
            fetch(`/api/snippets/${snippet.id}/collections`).then(r => r.json())
        ])
            .then(([allCols, assignedCols]) => {
                setCollections(allCols.collections ?? [])
                setAssignedIds(assignedCols.map((c: { id: number }) => c.id))
            })
    }, [colOpen, snippet.id])

    const handleToggleCollection = async (colId: number) => {
        const isAssigned = assignedIds.includes(colId)
        setAssignedIds(prev =>
            isAssigned ? prev.filter(id => id !== colId) : [...prev, colId]
        )
        try {
            await fetch(`/api/collections/${colId}/snippets`, {
                method: isAssigned ? "DELETE" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ snippetId: snippet.id })
            })
        } catch (error) {
            setAssignedIds(prev =>
                isAssigned ? [...prev, colId] : prev.filter(id => id !== colId)
            )
            console.error("Gagal toggle collection:", error)
        }
    }

    const toggleCollectionDropdown = (e: React.MouseEvent) => {
        e.stopPropagation()
        setColOpen(prev => !prev)
    }

    const lang = getLang(snippet.language)
    const normalizedLanguage = snippet.language.toLowerCase().trim().replace(/^\./, "")
    const isMarkdown = normalizedLanguage === "markdown" || normalizedLanguage === "md"

    const handleDelete = async () => {
        setDeleting(true)
        try {
            const res = await fetch(`/api/snippets/${snippet.id}`, { method: "DELETE" })
            if (!res.ok) throw new Error()
            router.refresh()
        } catch {
            alert("Gagal menghapus note.")
            setDeleting(false)
        }
    }

    const handleFavorite = async () => {
        const next = !isFavorite
        setIsFavorite(next)
        if (next) incrementFav()
        else decrementFav()
        toggleFavoriteId(snippet.id)
        try {
            const res = await fetch(`/api/snippets/${snippet.id}/favorite`, { method: "POST" })
            if (!res.ok) throw new Error()
        } catch {
            setIsFavorite(!next)
            if (next) decrementFav()
            else incrementFav()
            toggleFavoriteId(snippet.id)
        }
    }

    const handlePublic = async () => {
        const next = !isPublic
        setIsPublic(next)
        if (next) incrementPublicCount()
        else decrementPublicCount()
        togglePublicId(snippet.id)
        try {
            const res = await fetch(`/api/snippets/${snippet.id}/publish`, { method: "POST" })
            if (!res.ok) throw new Error()
        } catch {
            setIsPublic(!next)
            if (next) decrementPublicCount()
            else incrementPublicCount()
            togglePublicId(snippet.id)
        }
    }

    const handleOpenShare = async () => {
        if (shareId) {
            setShareOpen(true)
            return
        }

        setShareLoading(true)
        try {
            const res = await fetch(`/api/snippets/${snippet.id}/share`, { method: "POST" })
            const data = await res.json()
            setShareId(data.shareId)
            // FIX: buka modal di render cycle berikutnya setelah shareId ke-commit
            setTimeout(() => setShareOpen(true), 0)
        } catch {
            console.error("Gagal membuat share link")
        } finally {
            setShareLoading(false)
        }
    }

    const handleCopyUrl = async () => {
        const url = `${window.location.origin}/share/${shareId}`
        await navigator.clipboard.writeText(url)
        setUrlCopied(true)
        setTimeout(() => setUrlCopied(false), 2000)
    }

    const handleCopyCode = async () => {
        if (!shareId) return
        const formatted = formatDisplayCode(shareId)
        await navigator.clipboard.writeText(formatted)
        setCodeCopied(true)
        setTimeout(() => setCodeCopied(false), 2000)
    }

    const handleUnshare = async () => {
        try {
            await fetch(`/api/snippets/${snippet.id}/share`, { method: "POST" })
            setShareId(null)
            setShareOpen(false)
        } catch {
            console.error("Gagal unshare")
        }
    }

    const shareUrl = shareId
        ? `${typeof window !== "undefined" ? window.location.origin : ""}/share/${shareId}`
        : ""

    const formatDisplayCode = (code: string) => {
        return code.match(/.{1,3}/g)?.join("-") || code
    }

    return (
        <div className="flex-1 flex flex-col h-full min-h-0 overflow-y-auto lg:overflow-hidden bg-[var(--bg)]">
            <div className="px-5 lg:px-8 py-3 sm:py-5 border-b border-[var(--border)] bg-[#0d0f0e] shrink-0">
                <div className="flex items-start justify-between gap-4 mb-1 sm:mb-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <span
                                className="font-mono text-[9px] font-semibold px-[7px] py-[2px] rounded-[3px] border"
                                style={{
                                    color: lang.color,
                                    borderColor: lang.color + "55",
                                    background: lang.color + "18",
                                }}
                            >
                                {lang.label}
                            </span>
                            <span className="text-[12px] text-[var(--text3)]">{snippet.language}</span>
                        </div>
                        <h2 className="text-[19px] sm:text-[23px] font-semibold leading-tight truncate">
                            {snippet.title}
                        </h2>
                    </div>

                    {showPersonalControls && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleFavorite}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-all
                            ${isFavorite
                                    ? 'bg-yellow-400/10 border-yellow-400/50 text-yellow-300'
                                    : 'border-[var(--border2)] text-[var(--text3)] hover:border-yellow-400/50 hover:text-yellow-300'
                                }`}
                        >
                            <span className={`text-[14px] transition-transform ${isFavorite ? "scale-110" : ""}`}>
                                {isFavorite ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                ) : (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                )}
                            </span>
                            <span className="hidden sm:block">
                                {isFavorite ? "Favorited" : "Favorite"}
                            </span>
                        </button>
                        <button
                            onClick={handlePublic}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-all
                            ${isPublic
                                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-300'
                                    : 'border-[var(--border2)] text-[var(--text3)] hover:border-blue-500/50 hover:text-blue-300'
                                }`}
                        >
                            <span className="text-[14px]">
                                {isPublic ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm7.93 9h-3.17a15.5 15.5 0 00-1.09-4.37A8.03 8.03 0 0119.93 11zM12 4c.89 1.17 1.57 2.6 2.03 4H9.97C10.43 6.6 11.11 5.17 12 4zM4.07 13h3.17c.2 1.57.67 3.02 1.36 4.27A8.03 8.03 0 014.07 13zM7.24 11H4.07a8.03 8.03 0 014.53-4.27A15.5 15.5 0 007.24 11zm1.73 2h4.06c-.46 1.4-1.14 2.83-2.03 4-.89-1.17-1.57-2.6-2.03-4zm5.73 4.27c.69-1.25 1.16-2.7 1.36-4.27h3.17a8.03 8.03 0 01-4.53 4.27z" />
                                    </svg>
                                ) : (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17 8h-1V6a4 4 0 10-8 0v2H7a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2v-8a2 2 0 00-2-2zm-6 0V6a2 2 0 114 0v2h-4z" />
                                    </svg>
                                )}
                            </span>
                            <span className="hidden sm:block">
                                {isPublic ? "Public" : "Private"}
                            </span>
                        </button>
                    </div>
                    )}
                </div>

                {snippet.description && (
                    <p className="text-[12px] text-[var(--text3)] mb-2 sm:mb-3 leading-relaxed max-w-3xl">
                        {snippet.description}
                    </p>
                )}

                <div className="flex gap-1.5 mb-3 flex-wrap">
                    {snippet.tags.map(tag => (
                        <span
                            key={tag}
                            className="font-mono text-[8px] sm:text-[9px] text-[var(--text3)] bg-[var(--surface2)] border border-[var(--border2)] px-2.5 py-[3px] rounded-[4px]"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <CopyButton
                        code={snippet.code}
                        snippetId={snippet.id}
                        onCopy={() => setCopyCount(c => c + 1)}
                    />

                    {(canEdit || canDelete || canManageCollections || renderAdditionalActions) && (
                        <>
                    {canManageCollections && (
                    <div className="relative" ref={colRef}>
                        <button
                            onClick={toggleCollectionDropdown}
                            className={`flex items-center gap-2 text-[13px] font-medium px-4 py-2 rounded-lg border transition-all
                                ${colOpen
                                    ? 'border-[var(--em-border)] text-[var(--em)] bg-[var(--em-faint)]'
                                    : 'border-[var(--border2)] text-[var(--em-dim)] hover:border-green-500/60 hover:text-[var(--em)]'
                                }`}
                        >
                            <FontAwesomeIcon icon={faFolderPlus} className="w-[12px] h-[12px]" />
                            Collection
                        </button>

                        {colOpen && (
                            <div className="absolute left-0 top-10 z-50 w-[200px] rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl p-2">
                                {collections.length === 0 ? (
                                    <p className="text-[12px] text-[var(--text4)] px-2 py-2 italic">
                                        Belum ada collection
                                    </p>
                                ) : (
                                    collections.map(col => {
                                        const isAssigned = assignedIds.includes(col.id)
                                        return (
                                            <button
                                                key={col.id}
                                                onClick={() => handleToggleCollection(col.id)}
                                                className={`flex items-center justify-between w-full px-3 py-2 text-[12px] rounded-lg transition-all
                                                    ${isAssigned
                                                        ? 'text-[var(--em)] bg-[var(--em-faint)]'
                                                        : 'text-[var(--text2)] hover:bg-[var(--surface2)]'
                                                    }`}
                                            >
                                                <span className="truncate">{col.name}</span>
                                                {isAssigned && <span className="text-[10px] ml-2">✓</span>}
                                            </button>
                                        )
                                    })
                                )}
                            </div>
                        )}
                    </div>

                    )}

                    {/* Desktop */}
                    <div className="hidden sm:flex items-center gap-2">
                        {canEdit && (
                        <button
                            onClick={onEdit}
                            className="text-[13px] font-medium px-4 py-2 rounded-lg border border-[var(--border2)] text-yellow-700 hover:border-yellow-500/60 hover:text-yellow-300 transition-all"
                        >
                            Edit
                        </button>
                        )}

                        {canDelete && (
                        <button
                            onClick={() => setConfirmOpen(true)}
                            disabled={deleting}
                            className="text-[13px] font-medium px-4 py-2 rounded-lg border border-[var(--border2)] text-red-700 hover:border-red-500/60 hover:text-red-400 transition-all disabled:opacity-40"
                        >
                            {deleting ? "Menghapus..." : "Hapus"}
                        </button>
                        )}
                        {renderAdditionalActions?.("desktop")}
                    </div>

                    {/* Mobile */}
                    <div className="sm:hidden relative" ref={menuRef}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setMenuOpen(v => !v)
                            }}
                            className="p-2 rounded-lg border border-[var(--border2)] text-[var(--text3)]"
                        >
                            <FontAwesomeIcon icon={faEllipsisVertical} />
                        </button>

                        {menuOpen && (
                            <div className="absolute right-0 top-10 w-[150px] rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl p-2 z-50">
                                {canEdit && (
                                <button
                                    onClick={onEdit}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-[12px] rounded-lg hover:bg-[var(--surface2)]"
                                >
                                    Edit
                                </button>
                                )}
                                {canDelete && (
                                <button
                                    onClick={() => setConfirmOpen(true)}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-[12px] text-red-400 rounded-lg hover:bg-[var(--surface2)]"
                                >
                                    Hapus
                                </button>
                                )}
                                {renderAdditionalActions?.("mobile")}
                            </div>
                        )}
                    </div>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-4 mt-3 font-mono text-[8px] sm:text-[10px] text-[var(--text4)]">
                    <span>Disimpan {snippet.createdAt}</span>
                    <span>{copyCount} kali disalin</span>
                    {showPersonalControls && (
                        <span>{isPublic ? "Public" : "Private"}</span>
                    )}
                </div>
            </div>

            <div className="h-[420px] shrink-0 overflow-hidden sm:h-[520px] lg:h-auto lg:flex-1 lg:min-h-0">
                {isMarkdown ? (
                    <div className="flex h-full min-h-0 flex-col">
                        <div className="flex h-[40px] shrink-0 items-center justify-end border-b border-[var(--border)] bg-[#111312] px-4">
                            <div className="flex items-center rounded-md border border-[var(--border2)] bg-[#0b0d0c] p-[2px]">
                                <button
                                    onClick={() => setMarkdownMode("raw")}
                                    className={`flex h-[28px] items-center gap-1.5 rounded-[4px] px-3 text-[10px] font-medium transition-colors ${
                                        markdownMode === "raw"
                                            ? "bg-[var(--surface3)] text-[var(--text)]"
                                            : "text-[var(--text4)] hover:text-[var(--text2)]"
                                    }`}
                                >
                                    <FontAwesomeIcon icon={faCode} className="h-[10px] w-[10px]" />
                                    Raw
                                </button>
                                <button
                                    onClick={() => setMarkdownMode("preview")}
                                    className={`flex h-[28px] items-center gap-1.5 rounded-[4px] px-3 text-[10px] font-medium transition-colors ${
                                        markdownMode === "preview"
                                            ? "bg-[var(--surface3)] text-[var(--em)]"
                                            : "text-[var(--text4)] hover:text-[var(--text2)]"
                                    }`}
                                >
                                    <FontAwesomeIcon icon={faEye} className="h-[10px] w-[10px]" />
                                    Preview
                                </button>
                            </div>
                        </div>

                        <div className="min-h-0 flex-1">
                            {markdownMode === "preview" ? (
                                <MarkdownViewer content={snippet.code} />
                            ) : (
                                <CodeBlock code={snippet.code} language={snippet.language} />
                            )}
                        </div>
                    </div>
                ) : (
                    <CodeBlock code={snippet.code} language={snippet.language} />
                )}
            </div>

            <div className="flex items-center justify-between px-5 lg:px-8 py-2.5 border-t border-[var(--border)] bg-[#111312] shrink-0">
                <div className="flex items-center gap-4 font-mono text-[10px] text-[var(--text4)]">
                    <span>{snippet.code.split('\n').length} baris</span>
                    <span>UTF-8</span>
                    <span>{snippet.language}</span>
                </div>

                <button
                    onClick={handleOpenShare}
                    disabled={shareLoading}
                    className="flex items-center gap-1.5 font-mono text-[9px] sm:text-[12px] text-[var(--em-dim)] border border-[var(--em-border)] px-3 py-1.5 rounded-full hover:text-[var(--em)] transition-all disabled:opacity-50"
                >
                    {shareLoading ? (
                        <span className="w-[10px] h-[10px] border border-[var(--em-dim)] border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <FontAwesomeIcon icon={faLink} className="w-[9px] h-[9px]" />
                    )}
                    {shareLoading ? "Memproses..." : "Bagikan Note →"}
                </button>
            </div>

            {/* SHARE MODAL */}
            {shareOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="flex flex-col gap-5 rounded-xl p-6 w-full max-w-md bg-[var(--surface)] border border-[var(--border)] shadow-2xl">

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-[15px] font-semibold text-[var(--text)]">
                                    Bagikan Note
                                </h3>
                                <p className="text-[12px] text-[var(--text4)] mt-0.5">
                                    Siapapun dengan link ini bisa melihat note kamu
                                </p>
                            </div>
                            {showPersonalControls && (
                                <span className={`font-mono text-[10px] px-2.5 py-1 rounded-full border
                                    ${isPublic
                                        ? 'text-blue-300 border-blue-500/30 bg-blue-500/10'
                                        : 'text-[var(--text4)] border-[var(--border2)] bg-[var(--surface2)]'
                                    }`}>
                                    {isPublic ? "Public" : "Private"}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <span className="font-mono text-[10px] text-[var(--text4)]">Link bagikan</span>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 flex items-center gap-2 bg-[var(--bg)] border border-[var(--border2)] rounded-lg px-3 py-2.5 overflow-hidden">
                                    <FontAwesomeIcon icon={faLink} className="w-[10px] h-[10px] text-[var(--text4)] shrink-0" />
                                    <input
                                        readOnly
                                        value={shareUrl}
                                        className="flex-1 bg-transparent text-[12px] font-mono text-white outline-none truncate"
                                    />
                                </div>
                                <button
                                    onClick={handleCopyUrl}
                                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-[12px] font-semibold transition-all shrink-0
                                        ${urlCopied
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-emerald-500 text-[#0a0a0a] hover:bg-emerald-400'
                                        }`}
                                >
                                    <FontAwesomeIcon icon={urlCopied ? faCheck : faCopy} className="w-[11px] h-[11px]" />
                                    {urlCopied ? "Tersalin!" : "Salin"}
                                </button>
                            </div>
                        </div>

                        <div className="border-t border-[var(--border)]" />

                        <div className="flex flex-col gap-1.5">
                            <span className="font-mono text-[10px] text-[var(--text4)]">Atau gunakan kode</span>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 flex items-center gap-2 bg-[var(--bg)] border border-[var(--border2)] rounded-lg px-3 py-2.5 overflow-hidden">
                                    <FontAwesomeIcon icon={faCode} className="w-[10px] h-[10px] text-[var(--text4)] shrink-0" />
                                    <span className="flex-1 bg-transparent text-[12px] font-mono text-white truncate select-all">
                                        {shareId ? formatDisplayCode(shareId) : ""}
                                    </span>
                                </div>
                                <button
                                    onClick={handleCopyCode}
                                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-[12px] font-semibold transition-all shrink-0
                                        ${codeCopied
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-emerald-500 text-[#0a0a0a] hover:bg-emerald-400'
                                        }`}
                                >
                                    <FontAwesomeIcon icon={codeCopied ? faCheck : faCopy} className="w-[11px] h-[11px]" />
                                    {codeCopied ? "Tersalin!" : "Salin"}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <button
                                onClick={handleUnshare}
                                className="flex items-center gap-1.5 text-[12px] text-[var(--text4)] hover:text-red-400 transition-colors"
                            >
                                <FontAwesomeIcon icon={faLinkSlash} className="w-[10px] h-[10px]" />
                                Nonaktifkan link
                            </button>
                            <button
                                onClick={() => setShareOpen(false)}
                                className="text-[13px] font-medium px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--text3)] hover:bg-[var(--surface2)] transition-all"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="flex flex-col gap-4 rounded-xl p-6 w-full max-w-sm bg-[var(--surface)] border border-[var(--border)]">
                        <h3 className="text-[15px] font-semibold">Hapus note ini?</h3>
                        <p className="text-[13px] text-[var(--text3)]">
                            <span className="font-medium text-[var(--text)]">{snippet.title}</span>{" "}
                            akan dihapus permanen.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setConfirmOpen(false)}
                                className="px-4 py-2 rounded-lg text-[13px] border border-[var(--border)] text-[var(--text3)]"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="px-4 py-2 rounded-lg text-[13px] font-medium bg-red-500 text-white"
                            >
                                {deleting ? "Menghapus..." : "Ya, Hapus"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
