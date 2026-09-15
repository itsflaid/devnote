import { z } from "zod"
import { codeToHtml } from "shiki"
import { handleApiError } from "@/lib/apiError"
import { NextResponse } from "next/server"
import { toShikiLang } from "@/lib/shikiLangMap"

const THEME_ENUM = z.enum(["one-dark-pro", "github-dark", "dracula", "nord", "catppuccin-mocha"])

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const input = z.object({
      code: z.string(),
      language: z.string(),
      theme: THEME_ENUM.optional().default("one-dark-pro"),
    }).parse(body)

    const lang = toShikiLang(input.language)

    let html: string
    try {
      html = await codeToHtml(input.code, { lang, theme: input.theme })
    } catch {
      // Bahasa gak dikenal Shiki — fallback plaintext daripada request gagal total
      html = await codeToHtml(input.code, { lang: "plaintext", theme: input.theme })
    }

    return NextResponse.json({ html })
  } catch (err) {
    return handleApiError(err)
  }
}
