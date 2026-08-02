"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core"

interface NavItemProps {
  label: string
  count: number
  active?: boolean
  onClick?: () => void
  onPrefetch?: () => void
  dotColor?: string
  icon?: IconDefinition
}

export default function NavItem({
  label,
  count,
  active,
  onClick,
  onPrefetch,
  dotColor,
  icon,
}: NavItemProps) {
  return (
    <div
      onClick={onClick}
      onPointerEnter={onPrefetch}
      onTouchStart={onPrefetch}
      onFocus={onPrefetch}
      className={`relative flex items-center justify-between px-3 py-[8px] rounded-[4px] cursor-pointer text-[13px] transition-all
      ${
        active
          ? "bg-[#242925] text-[var(--text)] font-medium before:absolute before:left-0 before:inset-y-0 before:w-[2px] before:bg-[var(--em)]"
          : "text-[var(--text3)] hover:bg-[#202421] hover:text-[var(--text)]"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {icon ? (
          <FontAwesomeIcon
            icon={icon}
            className={`w-[12px] h-[12px] shrink-0 transition-all ${
              active ? "text-[var(--em)]" : "text-[var(--text4)]"
            }`}
          />
        ) : (
          <div
            className="w-[5px] h-[5px] rounded-full shrink-0"
            style={{ background: active ? "var(--em)" : dotColor ?? "var(--border2)" }}
          />
        )}

        <span className="truncate">{label}</span>
      </div>

      <span
        className={`font-mono text-[10px] px-2 py-[1px] rounded-full shrink-0
        ${
          active
            ? "text-[var(--em)] bg-[rgba(52,211,153,0.08)]"
            : "text-[var(--text4)] bg-[#202421]"
        }`}
      >
        {count}
      </span>
    </div>
  )
}
