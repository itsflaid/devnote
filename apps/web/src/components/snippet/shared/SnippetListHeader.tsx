"use client"

import { AnimatePresence, motion } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSlidersH } from "@fortawesome/free-solid-svg-icons"
import { getLang } from "@/lib/languages"

interface SnippetListHeaderProps {
  title?: string
  visibleCount: number
  totalCount: number
  activeLang: string | null
  filterOpen: boolean
  availableLangs: [string, number][]
  onToggleFilter: () => void
  onToggleLang: (lang: string) => void
}

export default function SnippetListHeader({
  title = "Semua Note",
  visibleCount,
  totalCount,
  activeLang,
  filterOpen,
  availableLangs,
  onToggleFilter,
  onToggleLang,
}: SnippetListHeaderProps) {
  return (
    <div className="shrink-0 border-b border-[var(--border)] bg-[#111312]">
      <div className="flex items-center justify-between px-5 py-[17px]">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold tracking-[1.5px] uppercase text-[var(--text2)]">
            {title}
          </span>

          <span className="font-mono text-[9px] text-[var(--text4)] bg-[var(--surface2)] px-2 py-[2px] rounded-full">
            {visibleCount}
            {activeLang ? ` / ${totalCount}` : ""}
          </span>
        </div>

        {availableLangs.length > 1 && (
          <button
            onClick={onToggleFilter}
            className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-[5px] rounded-[6px] border transition-all
              ${
                filterOpen || activeLang
                  ? "border-[var(--em-border)] text-[var(--em)] bg-[var(--em-faint)]"
                  : "border-[var(--border2)] text-[var(--text3)] hover:border-[var(--em-border)] hover:text-[var(--em)]"
              }`}
          >
            <FontAwesomeIcon icon={faSlidersH} className="w-[10px] h-[10px]" />
            Language

            {activeLang && (
              <span className="w-[5px] h-[5px] rounded-full bg-[var(--em)] ml-0.5 shrink-0" />
            )}
          </button>
        )}
      </div>

      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-4 pb-3">
              <p className="text-[9px] font-semibold tracking-[1.2px] uppercase text-[var(--text4)] mb-2">
                Filter bahasa
              </p>

              <div className="flex flex-wrap gap-[5px]">
                {availableLangs.map(([name, count]) => {
                  const langConfig = getLang(name)
                  const isActive = activeLang === name

                  return (
                    <button
                      key={name}
                      onClick={() => onToggleLang(name)}
                      className={`flex items-center gap-1.5 font-mono text-[10px] px-2.5 py-[4px] rounded-full border transition-all
                        ${
                          isActive
                            ? "border-[var(--em-border)] text-[var(--em)] bg-[var(--em-faint)]"
                            : "border-[var(--border2)] text-[var(--text3)] hover:border-[var(--em-border)] hover:text-[var(--em)]"
                        }`}
                    >
                      <span
                        className="w-[5px] h-[5px] rounded-full shrink-0"
                        style={{ background: langConfig.color }}
                      />

                      {name.charAt(0).toUpperCase() + name.slice(1)}

                      <span className="opacity-50">{count}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
