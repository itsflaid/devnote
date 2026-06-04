function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="h-4 w-36 rounded bg-[var(--surface3)]" />
          <div className="mt-3 h-3 w-full max-w-56 rounded bg-[var(--surface2)]" />
        </div>
        <div className="h-5 w-14 rounded-full bg-[var(--em-faint)]" />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
          <div className="h-5 w-8 rounded bg-[var(--em-faint)]" />
          <div className="mt-2 h-3 w-14 rounded bg-[var(--surface3)]" />
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
          <div className="h-5 w-8 rounded bg-[var(--em-faint)]" />
          <div className="mt-2 h-3 w-14 rounded bg-[var(--surface3)]" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="h-3 w-24 rounded bg-[var(--surface3)]" />
        <div className="h-3 w-10 rounded bg-[var(--surface3)]" />
      </div>
    </div>
  )
}

export default function WorkspacesLoading() {
  return (
    <main className="min-h-full animate-pulse p-6 text-[var(--text)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 h-3 w-20 rounded bg-[var(--surface3)]" />
            <div className="h-7 w-44 rounded bg-[var(--surface3)]" />
            <div className="mt-3 h-4 w-full max-w-lg rounded bg-[var(--surface2)]" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-20 rounded-lg border border-[var(--border)] bg-[var(--surface2)]" />
            <div className="h-10 w-32 rounded-lg bg-[var(--em-faint)]" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      </div>
    </main>
  )
}
