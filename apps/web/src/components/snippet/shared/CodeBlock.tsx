'use client'

import { useEffect, useState } from 'react'

export default function CodeBlock({ code, language }: {
    code: string
    language: string
}) {
    const [html, setHtml] = useState('')

    useEffect(() => {
        fetch('/api/highlight', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, language })
        })
            .then(res => res.json())
            .then(data => setHtml(data.html))
            .catch(() => setHtml('')) // fallback
    }, [code, language])

    // Fallback plain text
    if (!html) {
        return (
            <div className="h-full overflow-auto bg-[#080a08] p-6 font-mono text-[13px] text-[var(--text3)] leading-[1.8]">
                <pre className="whitespace-pre">{code}</pre>
            </div>
        )
    }

    return (
        <div 
            className="h-full overflow-auto [&>pre]:p-6 [&>pre]:min-h-full [&>pre]:font-mono [&>pre]:text-[13px] [&>pre]:leading-[1.8] [&>pre]:!bg-[#080a08]"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    )
}
