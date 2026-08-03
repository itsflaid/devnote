"use client"

import { useEffect, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { useAppStore } from "@/lib/store"
import { useSidebarStore } from "@/lib/sidebarStore"
import SidebarSection from "./SidebarSection"

interface TagSectionProps {
  tags: { name: string; count: number }[]
  onNavigate?: () => void
}

export default function TagSection({ tags, onNavigate }: TagSectionProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const { setIsNavigating } = useAppStore()
  const { collapsed, toggle } = useSidebarStore()

  const activeTag = searchParams.get("tag")

  useEffect(() => {
    tags.forEach(({ name }) => {
      if (name) router.prefetch(`/dashboard?tag=${encodeURIComponent(name)}`)
    })
  }, [router, tags])

  const setTag = (name: string) => {
    setIsNavigating(true)

    startTransition(() => {
      router.replace(`/dashboard?tag=${encodeURIComponent(name)}`)
    })

    onNavigate?.()
  }

  return (
    <SidebarSection
      title="Tags"
      open={!collapsed.tags}
      onToggle={() => toggle("tags")}
    >
      <div className="overflow-y-auto max-h-[100px]">
        <div className="flex flex-wrap gap-[5px] px-2 pt-1">
          {tags.map(({ name }) => (
            <span
              key={name}
              onClick={() => setTag(name)}
              onPointerEnter={() => router.prefetch(`/dashboard?tag=${encodeURIComponent(name)}`)}
              onTouchStart={() => router.prefetch(`/dashboard?tag=${encodeURIComponent(name)}`)}
              className={`font-mono text-[10px] px-2 py-[3px] rounded-full border cursor-pointer transition-all
              ${
                activeTag === name
                  ? "border-[var(--em-border)] text-[var(--em)] bg-[var(--em-faint)]"
                  : "border-[var(--border2)] text-[var(--text3)] hover:border-[var(--em-border)] hover:text-[var(--em)]"
              }`}
            >
              #{name}
            </span>
          ))}
        </div>
      </div>
    </SidebarSection>
  )
}
