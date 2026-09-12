import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/apiAuth"
import { getSidebarData } from "@/server/services/sidebarData"

export async function GET() {
  const authResult = await requireUserId()
  if ("error" in authResult) return authResult.error

  const data = await getSidebarData(authResult.userId)
  return NextResponse.json(data)
}
