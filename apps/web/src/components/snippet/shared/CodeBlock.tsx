'use client'

import { useEffect, useState } from 'react'
import { trpc } from "@/lib/trpc"
import { useAppStore } from "@/lib/store"

const FONT_SIZE_PRE_CLASS: Record<string, string> = {
    "12": "[&>pre]:text-[12px]",
    "13": "[&>pre]:text-[13px]",
    "14": "[&>pre]:text-[14px]",
}
const FONT_SIZE_FALLBACK_CLASS: Record<string, string> = {
    "12": "text-[12px]",
    "13": "text-[13px]",
    "14": "text-[14px]",
}

const THEME_VALUES = ["one-dark-pro", "github-dark", "dracula", "nord", "catppuccin-mocha"] as const
type HighlightTheme = (typeof THEME_VALUES)[number]

export default function CodeBlock({ code, language }: {
    code: string
    language: string
}) {
    const [html, setHtml] = useState('')
    const highlight = trpc.highlight.run.useMutation()
    const codeTheme = useAppStore(s => s.prefs.codeTheme)
    const codeFontSize = useAppStore(s => s.prefs.codeFontSize)
    const lineNumbers = useAppStore(s => s.prefs.lineNumbers)

    useEffect(() => {
        const theme = (THEME_VALUES as readonly string[]).includes(codeTheme)
            ? codeTheme as HighlightTheme
            : "one-dark-pro"
        highlight.mutate({ code, language, theme }, {
            onSuccess: (data) => setHtml(data.html),
            onError: () => setHtml(''),
        })
    }, [code, language, codeTheme])

    const fallbackFontClass = FONT_SIZE_FALLBACK_CLASS[codeFontSize] ?? FONT_SIZE_FALLBACK_CLASS["13"]
    const preFontClass = FONT_SIZE_PRE_CLASS[codeFontSize] ?? FONT_SIZE_PRE_CLASS["13"]

    // Fallback plain text
    if (!html) {
        return (
            <div className={`h-full overflow-auto bg-[#080a08] p-6 font-mono ${fallbackFontClass} text-[var(--text3)] leading-[1.8]`}>
                <pre className="whitespace-pre">{code}</pre>
            </div>
        )
    }

    return (
        <div
            className={`h-full overflow-auto [&>pre]:p-6 [&>pre]:min-h-full [&>pre]:font-mono ${preFontClass} [&>pre]:leading-[1.8] [&>pre]:!bg-[#080a08] ${lineNumbers ? 'code-line-numbers' : ''}`}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    )
}
