import { NextResponse } from "next/server"
import { ZodError } from "zod"

export function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status })
}

export function handleApiError(err: unknown) {
  if (err instanceof ZodError) {
    return jsonError(400, err.issues[0]?.message ?? "Input tidak valid")
  }
  console.error(err)
  return jsonError(500, "Terjadi kesalahan pada server")
}
