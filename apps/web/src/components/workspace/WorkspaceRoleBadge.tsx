interface WorkspaceRoleBadgeProps {
  role: "OWNER" | "EDITOR" | "VIEWER"
}

const roleClass = {
  OWNER: "border-[var(--em-border)] bg-[var(--em-faint)] text-[var(--em)]",
  EDITOR: "border-[var(--em-border)] bg-[var(--em-faint)] text-[var(--em)]",
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