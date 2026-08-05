"use client"

import { useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTimes } from "@fortawesome/free-solid-svg-icons"
import CodeBlock from "@/components/snippet/shared/CodeBlock"
import { getInitials, timeAgo } from "@/lib/format"
import Image from "next/image"
import type { PublicSnippet } from "./ExploreSnippetCard"

interface Lang { label: string; color: string }

interface Props {
    snippet: PublicSnippet | null
    lang: Lang
    liking: boolean
    copied: boolean
    onLikeClick: (e: React.MouseEvent) => void
    onCopyClick: (e: React.MouseEvent) => void
    onClose: () => void
}

export default function ExploreSnippetDetailModal({
    snippet, lang, liking, copied, onLikeClick, onCopyClick, onClose,
}: Props) {
    useEffect(() => {
        if (!snippet) return
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [snippet, onClose])

    if (!snippet) return null

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-[var(--border)]">
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
                        <div className="min-w-0">
                            <h3 className="text-[16px] font-semibold text-[var(--text)] leading-snug">
                                {snippet.title}
                            </h3>
                            <p className="text-[13px] text-[var(--text3)] mt-1 leading-relaxed">
                                {snippet.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2.5">
                                {snippet.user.avatar ? (
                                    <Image
                                        width={28}
                                        height={28}
                                        src={snippet.user.avatar}
                                        alt={snippet.user.name}
                                        className="w-6 h-6 rounded-full object-cover border border-[var(--border)]"
                                    />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--em-dim)] to-[var(--em)] flex items-center justify-center text-[#0a0a0a] text-[9px] font-bold shrink-0">
                                        {getInitials(snippet.user.name)}
                                    </div>
                                )}
                                <span className="text-[12px] font-medium text-[var(--text2)]">
                                    {snippet.user.name}
                                </span>
                                <span className="text-[11px] text-[var(--text3)]">
                                    · {timeAgo(snippet.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="shrink-0 w-8 h-8 flex items-center justify-center text-[var(--text3)] hover:text-[var(--text)] hover:bg-[var(--surface2)] rounded-lg transition-all"
                    >
                        <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-auto">
                    <CodeBlock code={snippet.code} language={snippet.language} />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-[var(--border)]">
                    <button
                        onClick={onLikeClick}
                        disabled={liking}
                        className={`flex items-center gap-1.5 text-[12px] transition-all px-2.5 py-1.5 rounded-lg ${
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

                    <button
                        onClick={onCopyClick}
                        className={`flex items-center gap-1.5 text-[12px] font-mono px-3 py-1.5 rounded-lg border transition-all ${
                            copied
                                ? "text-[var(--em)] border-[var(--em-border)] bg-[var(--em-faint)]"
                                : "text-[var(--text3)] border-[var(--border2)] bg-[var(--surface2)] hover:text-[var(--text)] hover:border-[var(--border2)]"
                        }`}
                    >
                        {copied ? (
                            <>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Disalin
                            </>
                        ) : (
                            <>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                </svg>
                                Salin
                            </>
                        )}
                    </button>

                    <div className="flex flex-wrap items-center gap-1.5 justify-end max-w-[45%]">
                        {snippet.tags.map(tag => (
                            <span
                                key={tag}
                                className="shrink-0 font-mono text-[10px] px-2 py-[2px] rounded-full text-[var(--text4)] bg-[var(--surface3)] border border-[var(--border)] whitespace-nowrap"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
