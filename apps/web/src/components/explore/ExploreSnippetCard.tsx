"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { getLang } from "@/lib/languages"
import { trpc } from "@/lib/trpc"
import CodeBlock from "@/components/snippet/shared/CodeBlock"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

export interface PublicSnippet {
    id: number
    title: string
    description: string | null
    code: string
    language: string
    copyCount: number
    createdAt: string
    tags: string[]
    user: { id: number; name: string; avatar: string | null }
    likeCount: number
    likedByMe: boolean
}

function timeAgo(dateStr: string) {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
    if (diff < 60) return "baru saja"
    if (diff < 3600) return `${Math.floor(diff / 60)} menit yang lalu`
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam yang lalu`
    if (diff < 604800) return `${Math.floor(diff / 86400)} hari yang lalu`
    if (diff < 2592000) return `${Math.floor(diff / 604800)} minggu yang lalu`
    return `${Math.floor(diff / 2592000)} bulan yang lalu`
}

function getInitials(name: string) {
    const words = name.trim().split(" ")
    if (words.length === 1) return words[0][0].toUpperCase()
    return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

interface Props {
    snippet: PublicSnippet
    onLikeToggle: (id: number, liked: boolean, count: number) => void
}

export default function ExploreSnippetCard({ snippet, onLikeToggle }: Props) {
    const { data: session } = useSession()
    const router = useRouter()
    const lang = getLang(snippet.language)

    const [expanded, setExpanded] = useState(false)
    const [liking, setLiking] = useState(false)
    const [copied, setCopied] = useState(false)
    const toggleLike = trpc.snippet.toggleLike.useMutation()
    const incrementCopy = trpc.snippet.incrementCopy.useMutation()

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!session?.user) {
            router.push("/login")
            return
        }
        if (liking) return
        setLiking(true)
        try {
            const data = await toggleLike.mutateAsync({ id: snippet.id })
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
        incrementCopy.mutate({ id: snippet.id })
    }

    return (
        <div className="group relative rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden transition-all hover:border-[var(--border2)]">
            
            {/* border kiri sesaui wrma bhs */}
            <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl z-10"
                style={{ backgroundColor: lang.color }}
            />

            {/* Header */}
            <div className="px-5 pt-5 pb-4 pl-7"> 
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
                            <h3 className="text-[14px] font-semibold text-[var(--text)] truncate leading-tight mb-1">
                                {snippet.title}
                            </h3>
                            {snippet.description && (
                                <p className="text-[12px] text-[var(--text3)] line-clamp-1">
                                    {snippet.description}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 text-right">
                        <div className="text-right hidden sm:block">
                            <div className="text-[12px] font-medium text-[var(--text2)]">
                                {snippet.user.name}
                            </div>
                            <div className="text-[11px] text-[var(--text3)]">
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

                {snippet.tags.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mt-3">
                        {snippet.tags.map(tag => (
                            <span
                                key={tag}
                                className="font-mono text-[10px] px-2 py-[2px] rounded-full text-[var(--text4)] bg-[var(--surface3)] border border-[var(--border)]"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between mt-4">
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

                    <button
                        onClick={() => setExpanded(v => !v)}
                        className="flex items-center gap-1.5 text-[11px] text-[var(--text3)] hover:text-[var(--text)] font-mono transition-all px-2 py-1 rounded-lg hover:bg-[var(--surface2)]"
                    >
                        <span
                            className="font-semibold"
                            style={{ color: lang.color }}
                        >
                            {lang.label}
                        </span>
                        <svg
                            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                            className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="border-t border-[var(--border)] relative"
                    >
                        <button
                            onClick={handleCopy}
                            className={`absolute top-3 right-3 z-10 flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded-lg border transition-all ${
                                copied
                                    ? "text-[var(--em)] border-[var(--em-border)] bg-[var(--em-faint)]"
                                    : "text-[var(--text3)] border-[var(--border)] bg-[var(--surface2)] hover:text-[var(--text)] hover:border-[var(--border2)]"
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

                        <div className="max-h-[360px] overflow-auto">
                            <CodeBlock code={snippet.code} language={snippet.language} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
