'use client'

import type { ReactNode } from "react"
import type { Snippet } from "./types"
import { getLang } from "@/lib/languages"
import { useAppStore } from "@/lib/store"

export default function SnippetCard({
    snippet,
    active,
    onClick,
    authorName,
    actionSlot,
}: {
    snippet: Snippet
    active?: boolean
    onClick?: () => void
    authorName?: string
    actionSlot?: ReactNode
}) {
    const lang = getLang(snippet.language)
    const isFav = useAppStore(s => s.favoriteIds.has(snippet.id))

    return (
        <div
            onClick={onClick}
            className={`relative p-3 rounded-[6px] cursor-pointer transition-all border mb-1
            ${active
                ? 'bg-[var(--surface)] border-[var(--em-border)] shadow-[0_0_0_1px_var(--em-border)]'
                : 'border-transparent hover:bg-[var(--surface2)] hover:border-[var(--border)]'
            }`}
        >
            <div
                className="absolute left-0 top-0 h-full w-[2px] rounded-l-[6px]"
                style={{ background: lang.color }}
            />

            <div className="flex items-center justify-between mb-[5px] gap-2">
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

                <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                >
                    {actionSlot}

                    <span style={{ color: isFav ? '#f59e0b' : 'var(--text3)' }}>
                        {isFav ? (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        ) : (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        )}
                    </span>
                </div>
            </div>

            <div className={`text-[13px] font-medium mb-[4px] truncate tracking-[-0.2px]
            ${active ? 'text-[var(--em)]' : 'text-[var(--text)]'}`}>
                {snippet.title}
            </div>

            {authorName && (
                <div className="text-[10px] text-[var(--text4)] mb-[5px] truncate">
                    by {authorName}
                </div>
            )}

            <div className="font-mono text-[10px] text-[var(--text3)] truncate mb-[6px]">
                {snippet.code.split('\n')[0]}
            </div>

            <div className="flex gap-1.5 flex-wrap">
                {snippet.tags.map(tag => (
                    <span
                        key={tag}
                        className={`font-mono text-[9px] px-[7px] py-[1px] rounded-full
                        ${active
                            ? 'text-[var(--em-dim)] bg-[var(--em-faint)]'
                            : 'text-[var(--text4)] bg-[var(--surface3)]'
                        }`}
                    >
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    )
}
