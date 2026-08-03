import { getInitials } from "@/lib/format"

interface AvatarProps {
  src: string | null | undefined
  name: string
  className?: string
}

export default function Avatar({ src, name, className }: AvatarProps) {
  if (src) {
    return <img src={src} alt={name} className={`shrink-0 rounded-full object-cover ${className ?? ""}`} />
  }

  return (
    <div
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full border-2 border-[var(--bg)] bg-gradient-to-br from-[var(--em-dim)] to-[var(--em)] font-bold text-[#0a0a0a] ${className ?? ""}`}
    >
      {getInitials(name)}
    </div>
  )
}