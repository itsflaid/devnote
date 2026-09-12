import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function requireUserId(): Promise<{ userId: number } | { error: NextResponse }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
  return { userId: Number(session.user.id) }
}

export async function getOptionalUserId(): Promise<number | null> {
  const session = await auth()
  return session?.user?.id ? Number(session.user.id) : null
}
