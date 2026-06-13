"use client"

import { useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCompass } from "@fortawesome/free-solid-svg-icons"

interface ExploreSectionProps {
  onNavigate?: () => void
}

export default function ExploreSection({ onNavigate }: ExploreSectionProps) {
  const router = useRouter()

  return (
    <div className="px-3 py-2 border-t border-[var(--border)]">
      <div
        onClick={() => {
          router.push("/explore")
          onNavigate?.()
        }}
        className="flex items-center justify-between px-3 py-2.5 rounded-[8px] cursor-pointer transition-all group bg-[var(--em-faint)] border border-[var(--em-border)] hover:bg-[var(--em)] hover:border-[var(--em)]"
      >
        <div className="flex items-center gap-2">
          <FontAwesomeIcon
            icon={faCompass}
            className="w-[11px] h-[11px] shrink-0 text-[var(--em)] group-hover:text-[#0a0a0a] transition-all"
          />
          <span className="text-[12px] font-medium text-[var(--em)] group-hover:text-[#0a0a0a] transition-all">
            Jelajahi Note Publik
          </span>
        </div>

        <span className="text-[11px] text-[var(--em)] group-hover:text-[#0a0a0a] group-hover:translate-x-1 transition-all">
          →
        </span>
      </div>
    </div>
  )
}
