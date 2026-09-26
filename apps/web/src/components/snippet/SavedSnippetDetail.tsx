"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import Image from "next/image"
import CopyButton from "./shared/CopyButton"
import CodeBlock from "./shared/CodeBlock"
import { getLang } from "@/lib/languages"
import { timeAgo, getInitials } from "@/lib/format"
import type { SavedLibraryItem } from "./savedTypes"

export default function SavedSnippetDetail({
  item,
  onUnsave,
}: {
  item: SavedLibraryItem
  onUnsave: (snippetId: number) => void
}) {
  const { snippet, owner } = item
  const router = useRouter()
  const queryClient = useQueryClient()
  const lang = getLang(snippet.language)

  const [liked, setLiked] = useState(item.likedByMe)
  const [likeCount, setLikeCount] = useState(item.likeCount)
  const [copyCount, setCopyCount] = useState(snippet.copyCount)
  const [isSaved, setIsSaved] = useState(true)
  const [saveCount, setSaveCount] = useState(item.saveCount)

  const toggleLike = useMutation({
    mutationFn: () =>
      fetch(`/api/snippets/${snippet.id}/like`, { method: "POST" }).then(
        (r) => r.json() as Promise<{ liked: boolean; count: number }>,
      ),
    onMutate: () => {
      const next = !liked
      setLiked(next)
      setLikeCount((c) => (next ? c + 1 : Math.max(0, c - 1)))
    },
    onSuccess: (data) => {
      setLiked(data.liked)
      setLikeCount(data.count)
    },
    onError: () => {
      setLiked(item.likedByMe)
      setLikeCount(item.likeCount)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["explore"] })
    },
  })

  const toggleSave = useMutation({
    mutationFn: () =>
      fetch(`/api/snippets/${snippet.id}/save`, { method: "POST" }).then(
        (r) => r.json() as Promise<{ isSaved: boolean; saveCount: number }>,
      ),
    onSuccess: (data) => {
      setIsSaved(data.isSaved)
      setSaveCount(data.saveCount)
      if (!data.isSaved) {
        queryClient.invalidateQueries({ queryKey: ["sidebar"] })
        queryClient.invalidateQueries({ queryKey: ["snippets", "saved"] })
        onUnsave(snippet.id)
        router.refresh()
      }
    },
  })

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-[var(--bg)]">
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
            <h2 className="text-[19px] sm:text-[23px] font-semibold leading-tight line-clamp-2">
              {snippet.title}
            </h2>
          </div>
        </div>

        {snippet.description && (
          <p className="text-[12px] text-[var(--text3)] mb-2 sm:mb-3 leading-relaxed max-w-3xl">
            {snippet.description}
          </p>
        )}

        <div className="flex gap-1.5 mb-3 flex-wrap">
          {snippet.tags.map((tag) => (
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
            onCopy={() => setCopyCount((c) => c + 1)}
          />

          <button
            onClick={() => toggleLike.mutate()}
            disabled={toggleLike.isPending}
            aria-label="Like note"
            className={`flex h-[36px] items-center gap-1.5 text-[12px] font-medium px-4 rounded-md border transition-all disabled:opacity-50
              ${liked
                ? "bg-[var(--em-faint)] border-[var(--em-border)] text-[var(--em)]"
                : "border-[var(--border2)] text-[var(--text3)] hover:text-[var(--em)] hover:border-[var(--em-border)]"
              }`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
              <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
            <span className="font-mono">{likeCount}</span>
          </button>

          <button
            onClick={() => toggleSave.mutate()}
            disabled={toggleSave.isPending}
            aria-label={isSaved ? "Hapus dari saved" : "Simpan note"}
            title={isSaved ? "Hapus dari saved" : "Simpan note"}
            className={`flex h-[36px] items-center gap-1.5 text-[12px] font-medium px-4 rounded-md border transition-all disabled:opacity-50
              ${isSaved
                ? "bg-yellow-400/10 border-yellow-400/50 text-yellow-300"
                : "border-[var(--border2)] text-[var(--text3)] hover:text-yellow-300 hover:border-yellow-400/50"
              }`}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill={isSaved ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <span className="font-mono">{saveCount}</span>
            <span className="hidden sm:inline">{isSaved ? "Tersimpan" : "Simpan"}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 mt-3">
          {owner.avatar ? (
            <Image
              width={24}
              height={24}
              src={owner.avatar}
              alt={owner.name}
              className="w-6 h-6 rounded-full object-cover border border-[var(--border)]"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--em-dim)] to-[var(--em)] flex items-center justify-center text-[#0a0a0a] text-[9px] font-bold shrink-0">
              {getInitials(owner.name)}
            </div>
          )}
          <span className="text-[12px] font-medium text-[var(--text2)]">@{owner.name}</span>
          <span className="text-[11px] text-[var(--text3)]">
            · {timeAgo(item.createdAtISO)} · {saveCount} disimpan
          </span>
        </div>

        <div className="flex items-center gap-4 mt-3 font-mono text-[8px] sm:text-[10px] text-[var(--text4)]">
          <span>Disimpan {timeAgo(item.savedAt)}</span>
          <span>{copyCount} kali disalin</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <CodeBlock code={snippet.code} language={snippet.language} />
      </div>

      <div className="flex items-center justify-between px-5 lg:px-8 py-2.5 border-t border-[var(--border)] bg-[#111312] shrink-0">
        <div className="flex items-center gap-4 font-mono text-[10px] text-[var(--text4)]">
          <span>{snippet.code.split("\n").length} baris</span>
          <span>UTF-8</span>
          <span>{snippet.language}</span>
        </div>
      </div>
    </div>
  )
}
