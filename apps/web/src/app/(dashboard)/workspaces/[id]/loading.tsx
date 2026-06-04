export default function WorkspaceDetailLoading() {
  return (
    <main className="min-h-full animate-pulse">
      <div className="flex min-h-[calc(100vh-64px)] flex-col bg-[var(--surface)]">
        <div className="shrink-0 border-b border-[var(--border)] bg-[var(--bg)] px-5 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-8 w-8 shrink-0 rounded-lg border border-[var(--border)] bg-[var(--surface2)]" />
              <div className="min-w-0">
                <div className="h-5 w-44 rounded bg-[var(--surface3)]" />
                <div className="mt-2 h-3 w-60 max-w-[55vw] rounded bg-[var(--surface2)]" />
              </div>
            </div>

            <div className="hidden shrink-0 gap-2 sm:flex">
              <div className="h-9 w-24 rounded-lg border border-[var(--border)] bg-[var(--surface2)]" />
              <div className="h-9 w-28 rounded-lg bg-[var(--em-faint)]" />
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <aside className="hidden w-[320px] shrink-0 border-r border-[var(--border)] p-2 md:block">
            <div className="px-2 py-3">
              <div className="h-3 w-28 rounded bg-[var(--surface3)]" />
              <div className="mt-2 h-3 w-44 rounded bg-[var(--surface2)]" />
            </div>

            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="mb-1 rounded-[6px] border border-transparent p-3">
                <div className="mb-3 h-4 w-14 rounded bg-[var(--em-faint)]" />
                <div className="mb-2 h-4 w-44 rounded bg-[var(--surface3)]" />
                <div className="h-3 w-52 rounded bg-[var(--surface2)]" />
              </div>
            ))}
          </aside>

          <section className="min-w-0 flex-1 p-5">
            <div className="mb-5 h-4 w-40 rounded bg-[var(--surface3)]" />
            <div className="mb-4 h-7 w-72 max-w-full rounded bg-[var(--surface3)]" />
            <div className="mb-2 h-4 w-full max-w-2xl rounded bg-[var(--surface2)]" />
            <div className="mb-8 h-4 w-full max-w-xl rounded bg-[var(--surface2)]" />
            <div className="h-64 rounded-xl border border-[var(--border)] bg-[var(--bg)]" />
          </section>
        </div>
      </div>
    </main>
  )
}
