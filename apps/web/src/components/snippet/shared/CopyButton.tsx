'use client'

import { useState } from "react"

export default function CopyButton({ 
    code, 
    snippetId,
    onCopy
}: { 
    code: string
    snippetId: number
    onCopy?: () => void  // callback opsional — dipanggil setelah copy berhasil
}) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        // salin kode ke clipboard browser
        navigator.clipboard.writeText(code)
        
        // ubah tampilan tombol jadi "Tersalin!" selama 2 detik
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)

        // beritahu parent bahwa copy sudah terjadi
        // pakai ?. supaya tidak error kalau onCopy tidak dikirim
        onCopy?.()

        // hit API di background — tidak perlu di-await karena
        // UI sudah update duluan (optimistic update)
        // .catch(() => {}) supaya error API tidak bikin app crash
        fetch(`/api/snippets/${snippetId}/copy`, { method: "POST" }).catch(() => {})
    }

    return (
        <button
            onClick={handleCopy}
            className={`flex items-center gap-2 text-[13px] font-semibold px-4 py-2 rounded-lg transition-all
        ${copied
                    ? 'bg-[var(--em-dim)] text-white'
                    : 'bg-[var(--em)] text-[#0a0a0a] hover:text-[var(--em)] hover:bg-transparent border-[1px] border-transparent hover:border-[1px] hover:border-[var(--em)] hover:shadow-[0_4px_16px_var(--em-glow)]'
                }`}
        >
            {copied ? 'Tersalin!' : 'Salin Kode'}
        </button>
    )
}
