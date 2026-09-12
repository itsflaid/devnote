'use client'

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"

export default function CopyButton({
    code,
    snippetId,
    onCopy
}: {
    code: string
    snippetId: number
    onCopy?: () => void
}) {
    const [copied, setCopied] = useState(false)
    const incrementCopy = useMutation({
        mutationFn: () =>
            fetch(`/api/snippets/${snippetId}/copy`, { method: "POST" }).then(r => r.json()),
    })

    const handleCopy = async () => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        onCopy?.()
        incrementCopy.mutate()
    }

    return (
        <button
            onClick={handleCopy}
            className={`flex h-[36px] items-center gap-2 text-[12px] font-semibold px-4 rounded-md border transition-all
        ${copied
                    ? 'bg-[var(--em-dim)] border-[var(--em-dim)] text-[#07100c]'
                    : 'bg-[var(--em)] border-[var(--em)] text-[#07100c] hover:bg-[#55e4ad] hover:border-[#55e4ad]'
                }`}
        >
            {copied ? 'Tersalin!' : 'Salin Kode'}
        </button>
    )
}
