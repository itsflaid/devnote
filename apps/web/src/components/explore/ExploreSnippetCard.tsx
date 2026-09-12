"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { getLang } from "@/lib/languages"
import { timeAgo, getInitials } from "@/lib/format"
import Image from "next/image"
import ExploreSnippetDetailModal from "@/components/explore/ExploreSnippetDetailModal"

export interface PublicSnippet {
    id: number
    title: string
    description: string | null
    code: string
    language: string
    copyCount: number
    createdAt: Date | string
    tags: string[]
    user: { id: number; name: string; avatar: string | null }
    likeCount: number
    likedByMe: boolean
}

interface Props {
    snippet: PublicSnippet
    onLikeToggle: (id: number, liked: boolean, count: number) => void
}

export default function ExploreSnippetCard({ snippet, onLikeToggle }: Props) {
    const { data: session } = useSession()
    const router = useRouter()
    const lang = getLang(snippet.language)

    const [detailOpen, setDetailOpen] = useState(false)
    const [liking, setLiking] = useState(false)
    const [copied, setCopied] = useState(false)
    const toggleLike = useMutation({
        mutationFn: (id: number) =>
            fetch(`/api/snippets/${id}/like`, { method: "POST" }).then(r => r.json() as Promise<{ liked: boolean; count: number }>),
    })
    const incrementCopy = useMutation({
        mutationFn: (id: number) =>
            fetch(`/api/snippets/${id}/copy`, { method: "POST" }).then(r => r.json()),
    })

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!session?.user) {
            router.push("/login")
            return
        }
        if (liking) return
        setLiking(true)
        try {
            const data = await toggleLike.mutateAsync(snippet.id)
            onLikeToggle(snippet.id, data.liked, data.count)
        } finally {
            setLiking(false)
        }
    }

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation()
        await navigator.clipboard.writeText(snippet.code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        incrementCopy.mutate(snippet.id)
    }

    const previewCode = snippet.code.split("\n").slice(0, 7).join("\n")

    return (
        <div
            onClick={() => setDetailOpen(true)}
            className="group relative rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden flex flex-col transition-all hover:border-[var(--border2)] cursor-pointer"
        >
            {/* border kiri sesaui wrma bhs */}
            <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl z-10"
                style={{ backgroundColor: lang.color }}
            />

            {/* Header */}
            <div className="px-5 pt-5 pb-0 pl-7">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                        <div
                            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono border"
                            style={{
                                color: lang.color,
                                borderColor: lang.color + "44",
                                background: lang.color + "18",
                            }}
                        >
                            {lang.label}
                        </div>

                        <div className="min-w-0 flex-1">
                            <h3 className="text-[14px] font-semibold text-[var(--text)] truncate leading-[18px]">
                                {snippet.title}
                            </h3>
                            <p className="text-[12px] text-[var(--text3)] line-clamp-1 leading-[16px] mt-1 min-h-[16px]">
                                {snippet.description || "\u00A0"}
                            </p>
                        </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 text-right">
                        <div className="text-right hidden sm:block">
                            <div className="text-[12px] font-medium text-[var(--text2)] leading-[16px]">
                                {snippet.user.name}
                            </div>
                            <div className="text-[11px] text-[var(--text3)] leading-[16px] mt-1 min-h-[16px]">
                                {timeAgo(snippet.createdAt)}
                            </div>
                        </div>
                        {snippet.user.avatar ? (
                            <Image
                                width={40}
                                height={40}
                                src={snippet.user.avatar}
                                alt={snippet.user.name}
                                className="w-7 h-7 rounded-full object-cover border border-[var(--border)]"
                            />
                        ) : (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--em-dim)] to-[var(--em)] flex items-center justify-center text-[#0a0a0a] text-[10px] font-bold shrink-0">
                                {getInitials(snippet.user.name)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tag row */}
            <div className="flex items-center gap-1.5 mt-3 px-5 pl-7 h-[22px] overflow-hidden">
                {snippet.tags.slice(0, 3).map(tag => (
                    <span
                        key={tag}
                        className="shrink-0 font-mono text-[10px] px-2 py-[2px] rounded-full text-[var(--text4)] bg-[var(--surface3)] border border-[var(--border)] whitespace-nowrap"
                    >
                        {tag}
                    </span>
                ))}
                {snippet.tags.length > 3 && (
                    <span className="shrink-0 font-mono text-[10px] px-2 py-[2px] rounded-full text-[var(--text3)] border border-dashed border-[var(--border2)] whitespace-nowrap">
                        +{snippet.tags.length - 3}
                    </span>
                )}
            </div>

            {/* Code preview */}
            <div className="relative mx-5 ml-7 mt-3 h-[112px] rounded-lg border border-[var(--border2)] bg-[var(--bg2)] overflow-hidden">
                <pre className="p-3 font-mono text-[11.5px] leading-[1.6] text-[var(--text2)] whitespace-pre">
                    {previewCode}
                </pre>
                <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-9"
                    style={{ background: "linear-gradient(to bottom, transparent, var(--bg2))" }}
                />
                <button
                    onClick={(e) => { e.stopPropagation(); handleCopy(e) }}
                    className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-md border flex items-center justify-center ${
                        copied
                            ? "text-[var(--em)] border-[var(--em-border)] bg-[var(--em-faint)]"
                            : "text-[var(--text3)] border-[var(--border2)] bg-[var(--surface3)] hover:text-[var(--text)]"
                    }`}
                >
                    {copied ? (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    ) : (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 pb-4 pl-7 pt-3 mt-3 border-t border-[var(--border2)]">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleLike}
                        disabled={liking}
                        className={`flex items-center gap-1.5 text-[12px] transition-all px-2 py-1 rounded-lg ${
                            snippet.likedByMe
                                ? "text-[var(--em)] bg-[var(--em-faint)]"
                                : "text-[var(--text3)] hover:text-[var(--em)] hover:bg-[var(--em-faint)]"
                        }`}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill={snippet.likedByMe ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
                            <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                        </svg>
                        <span className="font-mono">{snippet.likeCount}</span>
                    </button>

                    <span className="flex items-center gap-1.5 text-[12px] text-[var(--text3)] font-mono">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        {snippet.copyCount}
                    </span>
                </div>

                <span className="flex items-center gap-1 text-[11px] font-mono text-[var(--text3)] group-hover:text-[var(--text2)] transition-colors">
                    Buka
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                </span>
            </div>

            <ExploreSnippetDetailModal
                snippet={detailOpen ? snippet : null}
                lang={lang}
                liking={liking}
                copied={copied}
                onLikeClick={handleLike}
                onCopyClick={handleCopy}
                onClose={() => setDetailOpen(false)}
            />
        </div>
    )
}
