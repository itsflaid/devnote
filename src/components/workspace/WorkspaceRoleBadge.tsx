interface WorkspaceRoleBadgeProps {
  role: "OWNER" | "EDITOR" | "VIEWER"
}

const roleClass = {
  OWNER: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
  EDITOR: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  VIEWER: "border-[var(--border)] bg-[var(--bg)] text-[var(--text4)]",
}

const roleLabel = {
  OWNER: "Owner",
  EDITOR: "Editor",
  VIEWER: "Viewer",
}

export default function WorkspaceRoleBadge({ role }: WorkspaceRoleBadgeProps) {
  return (
    <span
      className={`text-[10px] uppercase tracking-[1px] px-2 py-1 rounded-full border ${roleClass[role]}`}
    >
      {roleLabel[role]}
    </span>
  )
}