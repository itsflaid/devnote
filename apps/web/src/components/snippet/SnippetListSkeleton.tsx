import SnippetCardSkeleton from "./SnippetCardSkeleton"

export default function SnippetListSkeleton() {
    return (
        <>
            {/* desktop */}
            <div className="hidden lg:flex h-full overflow-hidden">
                <div className="w-[300px] border-r border-[var(--border)] flex flex-col shrink-0">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] shrink-0">
                        <div className="h-[10px] w-[90px] rounded bg-[var(--surface3)] animate-pulse" />
                        <div className="h-[16px] w-[24px] rounded-full bg-[var(--surface3)] animate-pulse" />
                    </div>
                    <div className="flex-1 overflow-hidden p-2 flex flex-col gap-0.5">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <SnippetCardSkeleton key={i} />
                        ))}
                    </div>
                </div>

                {/* Detail Panel Skeleton */}
                <div className="flex-1 flex flex-col animate-pulse overflow-hidden">
                    {/* Top bar — favorite button area */}
                    <div className="px-6 py-3 border-b border-[var(--border)] flex items-center justify-end shrink-0">
                        <div className="h-[28px] w-[110px] rounded-lg bg-[var(--surface3)]" />
                    </div>

                    {/* Title + tags + action buttons + metadata */}
                    <div className="px-6 py-4 border-b border-[var(--border)] flex flex-col gap-3 shrink-0">
                        {/* Language badge + title */}
                        <div className="flex items-center gap-2">
                            <div className="h-[20px] w-[40px] rounded bg-[var(--surface3)]" />
                            <div className="h-[10px] w-[60px] rounded bg-[var(--surface3)]" />
                        </div>
                        <div className="h-[28px] w-[280px] rounded bg-[var(--surface3)]" />

                        {/* Tags */}
                        <div className="flex gap-2">
                            <div className="h-[22px] w-[80px] rounded-full bg-[var(--surface3)]" />
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2">
                            <div className="h-[34px] w-[100px] rounded-lg bg-[var(--surface3)]" />
                            <div className="h-[34px] w-[100px] rounded-lg bg-[var(--surface3)]" />
                            <div className="h-[34px] w-[70px] rounded-lg bg-[var(--surface3)]" />
                            <div className="h-[34px] w-[70px] rounded-lg bg-[var(--surface3)]" />
                        </div>

                        {/* Metadata — saved date, copies, visibility */}
                        <div className="flex gap-4">
                            <div className="h-[10px] w-[120px] rounded bg-[var(--surface3)]" />
                            <div className="h-[10px] w-[80px] rounded bg-[var(--surface3)]" />
                            <div className="h-[10px] w-[50px] rounded bg-[var(--surface3)]" />
                        </div>
                    </div>

                    {/* Code area */}
                    <div className="flex-1 m-4 rounded-[8px] bg-[var(--surface3)]" />

                    {/* Footer — line count, encoding, lang */}
                    <div className="px-4 py-2 border-t border-[var(--border)] flex items-center gap-4 shrink-0">
                        <div className="h-[10px] w-[50px] rounded bg-[var(--surface3)]" />
                        <div className="h-[10px] w-[40px] rounded bg-[var(--surface3)]" />
                        <div className="h-[10px] w-[30px] rounded bg-[var(--surface3)]" />
                    </div>
                </div>
            </div>

            {/* mobile */}
            <div className="flex lg:hidden h-full flex-col bg-[var(--bg2)]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] shrink-0">
                    <div className="h-[10px] w-[90px] rounded bg-[var(--surface3)] animate-pulse" />
                    <div className="h-[16px] w-[24px] rounded-full bg-[var(--surface3)] animate-pulse" />
                </div>
                <div className="flex-1 overflow-hidden p-2 flex flex-col gap-0.5">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <SnippetCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </>
    )
}