"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown } from "@fortawesome/free-solid-svg-icons"
import { AnimatePresence, motion } from "framer-motion"

interface SidebarSectionProps {
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
  right?: React.ReactNode
  withBorder?: boolean
}

export default function SidebarSection({
  title,
  open,
  onToggle,
  children,
  right,
  withBorder = true,
}: SidebarSectionProps) {
  return (
    <div className={`relative z-10 px-3 py-3 ${withBorder ? "border-t border-[var(--border)]" : ""}`}>
      <div
        onClick={onToggle}
        className={`flex min-h-[32px] items-center justify-between px-2 cursor-pointer group ${
          open ? "mb-1.5" : ""
        }`}
      >
        <div className="flex items-center gap-2">
          <p className="text-[9px] font-semibold tracking-[1.7px] uppercase text-[var(--text4)] group-hover:text-[var(--text3)] transition-colors">
            {title}
          </p>
          {right}
        </div>

        <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.2 }}>
          <FontAwesomeIcon icon={faChevronDown} className="w-[8px] h-[8px] text-[var(--text4)]" />
        </motion.div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
