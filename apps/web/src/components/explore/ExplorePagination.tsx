"use client"

interface Props {
    page: number
    totalPages: number
    onChange: (page: number) => void
}

export default function ExplorePagination({ page, totalPages, onChange }: Props) {
    if (totalPages <= 1) return null

    // Build page numbers to show: << < 1 2 3 ... 7 8 9 > >>
    const pages: (number | "...")[] = []

    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
        pages.push(1)
        if (page > 3) pages.push("...")
        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
            pages.push(i)
        }
        if (page < totalPages - 2) pages.push("...")
        pages.push(totalPages)
    }

    const btnBase = "w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-mono transition-all border"
    const btnActive = "bg-[var(--em-faint)] text-[var(--em)] border-[var(--em-border)]"
    const btnInactive = "text-[var(--text3)] border-[var(--border)] hover:text-[var(--text)] hover:bg-[var(--surface2)] hover:border-[var(--border2)]"
    const btnDisabled = "text-[var(--surface3)] border-[var(--surface3)] cursor-not-allowed"

    return (
        <div className="flex items-center justify-center gap-1.5 py-8">
            {/* << first */}
            <button
                onClick={() => onChange(1)}
                disabled={page === 1}
                className={`${btnBase} ${page === 1 ? btnDisabled : btnInactive}`}
            >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" />
                </svg>
            </button>

            {/* < prev */}
            <button
                onClick={() => onChange(page - 1)}
                disabled={page === 1}
                className={`${btnBase} ${page === 1 ? btnDisabled : btnInactive}`}
            >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
            </button>

            {/* pages */}
            {pages.map((p, i) =>
                p === "..." ? (
                    <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-[12px] text-[var(--text3)]">
                        ...
                    </span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onChange(p)}
                        className={`${btnBase} ${p === page ? btnActive : btnInactive}`}
                    >
                        {p}
                    </button>
                )
            )}

            {/* > next */}
            <button
                onClick={() => onChange(page + 1)}
                disabled={page === totalPages}
                className={`${btnBase} ${page === totalPages ? btnDisabled : btnInactive}`}
            >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                </svg>
            </button>

            {/* >> last */}
            <button
                onClick={() => onChange(totalPages)}
                disabled={page === totalPages}
                className={`${btnBase} ${page === totalPages ? btnDisabled : btnInactive}`}
            >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" />
                </svg>
            </button>
        </div>
    )
}