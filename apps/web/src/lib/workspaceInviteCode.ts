const INVITE_CODE_LENGTH = 9
const INVITE_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ"

export function generateWorkspaceInviteCode() {
  let code = ""

  for (let index = 0; index < INVITE_CODE_LENGTH; index++) {
    code +=
      INVITE_CODE_CHARS[
        Math.floor(Math.random() * INVITE_CODE_CHARS.length)
      ]
  }

  return code
}

export function formatWorkspaceInviteCode(code: string) {
  const normalized = code.trim().toUpperCase()

  if (!/^[A-Z0-9]{9}$/.test(normalized)) {
    return normalized
  }

  return `${normalized.slice(0, 3)}-${normalized.slice(3, 6)}-${normalized.slice(6)}`
}

export function normalizeWorkspaceInviteCode(code: unknown) {
  const normalized = String(code ?? "").trim().toUpperCase()
  const withoutSeparators = normalized.replace(/-/g, "")

  return /^[A-Z0-9]{9}$/.test(withoutSeparators)
    ? withoutSeparators
    : normalized
}
