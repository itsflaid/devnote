"use client"

interface StatsSectionProps {
  totalSnippets: number
  totalCopies: number
  totalTags: number
}

export default function StatsSection({
  totalSnippets,
  totalCopies,
  totalTags,
}: StatsSectionProps) {
  const stats = [
    { val: totalSnippets.toString(), label: "Notes" },
    { val: totalCopies.toString(), label: "Copies" },
    { val: totalTags.toString(), label: "Tags" },
  ]

  return (
    <div className="relative z-10 mt-auto px-4 py-4 border-t border-[var(--border)]">
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border-l border-[var(--border)] pl-3 first:border-l-0 first:pl-0"
          >
            <div className="font-mono text-[17px] font-semibold text-[var(--text)] leading-none mb-1">
              {stat.val}
            </div>
            <div className="text-[9px] text-[var(--text4)] truncate">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
