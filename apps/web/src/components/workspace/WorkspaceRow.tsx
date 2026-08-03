import Link from "next/link"
import { formatWorkspaceInviteCode } from "@/lib/workspaceInviteCode"
import { timeAgo } from "@/lib/format"

interface WorkspaceRowProps {
  workspace: {
    id: number
    name: string
    description: string | null
    inviteCode: string
    role: "OWNER" | "EDITOR" | "VIEWER"
    snippetsCount: number
    membersCount: number
    updatedAt: string
  }
}

const roleLabel = {
  OWNER: "Owner",
  EDITOR: "Editor",
  VIEWER: "Viewer",
}

export default function WorkspaceRow({ workspace }: WorkspaceRowProps) {
  return (
    <Link
      href={`/workspaces/${workspace.id}`}
      className="group relative flex items-center justify-between gap-4 px-5 py-4 border-b border-[var(--border)] last:border-b-0 hover:bg-[#141715] transition-all"
    >
      <span
        className="absolute left-0 top-0 h-full w-[1px] group-hover:w-[2px] group-hover:bg-[var(--em)] transition-all"
        style={{ background: "var(--border)" }}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-[14px] font-medium text-[var(--text)] truncate group-hover:text-[var(--em)] transition-colors">
            {workspace.name}
          </h2>
          <span className="shrink-0 font-mono text-[9px] uppercase tracking-[1px] px-[7px] py-[2px] rounded-[3px] border border-[var(--em-border)] bg-[var(--em-faint)] text-[var(--em)]">
            {roleLabel[workspace.role]}
          </span>
        </div>

        {workspace.description && (
          <p className="text-[11px] text-[var(--text4)] truncate mb-1.5">
            {workspace.description}
          </p>
        )}

        <div className="font-mono text-[11px] text-[var(--text4)]">
          {workspace.snippetsCount} notes · {workspace.membersCount} members · diupdate {timeAgo(workspace.updatedAt)}
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-3">
        <span className="hidden sm:inline font-mono text-[11px] text-[var(--text4)]">
          {formatWorkspaceInviteCode(workspace.inviteCode)}
        </span>
        <span className="text-[11px] text-[var(--text4)] group-hover:text-[var(--em)] group-hover:translate-x-1 transition-all">
          →
        </span>
      </div>
    </Link>
  )
}