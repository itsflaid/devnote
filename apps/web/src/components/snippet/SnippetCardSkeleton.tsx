// components/dashboard/SnippetCardSkeleton.tsx
export default function SnippetCardSkeleton() {
    return (
        <div className="relative pl-3 pr-3 py-3 rounded-[6px] border border-transparent animate-pulse">
            {/* left accent bar */}
            <div className="absolute left-0 top-0 h-full w-[2px] rounded-l-[6px] bg-[var(--surface3)]" />

            {/* row 1: lang badge + star */}
            <div className="flex items-center justify-between mb-[5px]">
                <div className="h-[16px] w-[48px] rounded-[3px] bg-[var(--surface3)]" />
                <div className="h-[11px] w-[11px] rounded-sm bg-[var(--surface3)]" />
            </div>

            {/* row 2: title */}
            <div className="h-[13px] w-[65%] rounded-[4px] bg-[var(--surface3)] mb-[5px]" />

            {/* row 3: first code line */}
            <div className="h-[10px] w-[85%] rounded-[4px] bg-[var(--surface3)] mb-[6px]" />

            {/* row 4: tags */}
            <div className="flex gap-1.5">
                <div className="h-[16px] w-[36px] rounded-full bg-[var(--surface3)]" />
                <div className="h-[16px] w-[28px] rounded-full bg-[var(--surface3)]" />
            </div>
        </div>
    )
}