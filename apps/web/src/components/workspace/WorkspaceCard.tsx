import Link from "next/link"

interface WorkspaceCardProps {
  workspace: {
    id: number
    name: string
    description: string | null
    inviteCode: string
    role: "OWNER" | "EDITOR" | "VIEWER"
    snippetsCount: number
    membersCount: number
    createdAt: string
  }
}

const roleLabel = {
  OWNER: "Owner",
  EDITOR: "Editor",
  VIEWER: "Viewer",
}

export default function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  return (
    <Link
      href={`/workspaces/${workspace.id}`}
      className="group block rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-[var(--em-border)] hover:bg-[var(--surface2)] transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2 className="font-semibold text-[var(--text)] truncate group-hover:text-[var(--em)] transition-colors">
            {workspace.name}
          </h2>

          <p className="text-xs text-[var(--text4)] mt-1 line-clamp-2">
            {workspace.description || "Tidak ada deskripsi"}
          </p>
        </div>

        <span className="text-[10px] uppercase tracking-[1px] px-2 py-1 rounded-full border border-[var(--em-border)] bg-[var(--em-faint)] text-[var(--em)] shrink-0">
          {roleLabel[workspace.role]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="rounded-xl bg-[var(--bg)] border border-[var(--border)] p-3">
          <p className="text-lg font-mono font-semibold text-[var(--em)] leading-none">
            {workspace.snippetsCount}
          </p>
          <p className="text-[11px] text-[var(--text4)] mt-1">Notes</p>
        </div>

        <div className="rounded-xl bg-[var(--bg)] border border-[var(--border)] p-3">
          <p className="text-lg font-mono font-semibold text-[var(--em)] leading-none">
            {workspace.membersCount}
          </p>
          <p className="text-[11px] text-[var(--text4)] mt-1">Members</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 text-[11px] text-[var(--text4)]">
        <span className="min-w-0 truncate font-mono">{workspace.inviteCode}</span>
        <span className="shrink-0 group-hover:text-[var(--em)] transition-colors">
          Buka →
        </span>
      </div>
    </Link>
  )
}
