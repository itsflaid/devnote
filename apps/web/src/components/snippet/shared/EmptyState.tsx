"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import Link from "next/link"

interface EmptyStateProps {
  icon: IconDefinition
  title: string
  subtitle: string
  action:
    | { type: "button"; label: string; onClick: () => void }
    | { type: "link"; label: string; href: string }
}

export default function EmptyState({
  icon,
  title,
  subtitle,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center px-6">
        <div className="w-[56px] h-[56px] rounded-[12px] border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center text-[var(--text3)]">
          <FontAwesomeIcon icon={icon} className="w-[22px] h-[22px]" />
        </div>

        <div>
          <p className="text-[15px] font-semibold text-[var(--text)] mb-1">
            {title}
          </p>

          <p className="text-[13px] text-[var(--text3)]">
            {subtitle}
          </p>
        </div>

        {action.type === "button" ? (
          <button
            onClick={action.onClick}
            className="flex items-center gap-2 bg-[var(--em)] text-[#0a0a0a] font-semibold text-[13px] px-5 py-2.5 rounded-lg hover:bg-[#2bc48a] transition-all"
          >
            <FontAwesomeIcon icon={faPlus} className="w-[12px] h-[12px]" />
            {action.label}
          </button>
        ) : (
          <Link
            href={action.href}
            className="flex items-center gap-2 border border-[var(--border)] text-[var(--text2)] font-semibold text-[13px] px-5 py-2.5 rounded-lg hover:bg-[var(--surface2)] transition-all"
          >
            {action.label}
          </Link>
        )}
      </div>
    </div>
  )
}