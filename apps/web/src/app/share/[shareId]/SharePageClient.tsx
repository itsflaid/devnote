"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import CodeBlock from "@/components/snippet/shared/CodeBlock"
import { getLang } from "@/lib/languages"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser, faCopy, faCheck, faArrowRight } from "@fortawesome/free-solid-svg-icons"
import { useSession } from "next-auth/react"

interface ShareSnippet {
    id: number
    title: string
    description: string | null
    code: string
    language: string
    isPublic: boolean
    copyCount: number
    createdAt: string
    tags: string[]
    user: {
        name: string
        avatar: string | null
    }
}

export default function SharePageSplit({ snippet }: { snippet: ShareSnippet }) {
    const [copied, setCopied] = useState(false)
    const [copyCount, setCopyCount] = useState(snippet.copyCount)
    const lang = getLang(snippet.language)

    const { data: session } = useSession()


    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(snippet.code)
            setCopied(true)
            setCopyCount(c => c + 1)
            fetch(`/api/snippets/${snippet.id}/copy`, { method: "POST" }).catch(() => {})
            setTimeout(() => setCopied(false), 1800)
        } catch {
            const ta = document.createElement("textarea")
            ta.value = snippet.code
            document.body.appendChild(ta)
            ta.select()
            document.execCommand("copy")
            document.body.removeChild(ta)
            setCopied(true)
            setTimeout(() => setCopied(false), 1800)
        }
    }

    const formattedDate = new Date(snippet.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
    })

    return (
        <div className="min-h-screen w-full bg-[#0a0f0c] overflow-hidden flex items-center justify-center p-0 sm:p-4 relative">

            {/* Background Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(52, 211, 153, 0.08) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(52, 211, 153, 0.08) 1px, transparent 1px)
                        `,
                        backgroundSize: '60px 60px'
                    }}
                />
                <div className="absolute -top-40 -left-40 w-[420px] h-[420px] md:w-[600px] md:h-[600px] rounded-full bg-emerald-500/10 blur-[110px]" />
            </div>

            <div className="relative w-full h-screen lg:max-w-6xl lg:mx-auto lg:h-[680px]">
                
                <div className="bg-[#111a16] border-0 sm:border border-emerald-500/20 rounded-none sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row h-full">

                    <div className="w-full lg:w-[310px] bg-[#0c1210] border-b lg:border-b-0 lg:border-r border-emerald-500/10 
                                    p-4 lg:p-7 flex flex-col">

                        <div className="flex items-center justify-between mb-2 lg:mb-6">
                            <Link href="/" className="flex items-center gap-2 group">
                                <Image
                                    src="/emerald-trans-bg.png"
                                    alt="devnote"
                                    width={50}
                                    height={50}
                                    className="transition-transform group-hover:scale-110"
                                />
                                <span className="text-md sm:text-lg font-semibold tracking-tighter text-white">
                                    dev<span className="text-emerald-400">note</span>
                                </span>
                            </Link>

                            <Link
                                href={session ? "/dashboard" : "/"}
                                className="lg:hidden group flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 transition-all 
                                        text-black font-medium px-4 py-1.5 rounded-2xl text-xs whitespace-nowrap"
                            >
                                {session? "Dashboard" : "Gabung"}
                                <FontAwesomeIcon 
                                    icon={faArrowRight} 
                                    className="group-hover:translate-x-0.5 transition-transform text-[10px]" 
                                />
                            </Link>
                        </div>

                        <div className="h-px bg-emerald-500/10 mb-1 sm:mb-5" />

                        <div className="flex-1 space-y-2 sm:space-y-4 min-h-0 overflow-hidden">
                            <span
                                className="font-mono text-[9px] font-semibold px-2.5 py-0.5 rounded-full border inline-block"
                                style={{
                                    color: lang.color,
                                    borderColor: lang.color + "70",
                                    background: lang.color + "15",
                                }}
                            >
                                {lang.label}
                            </span>

                            <h1 className="text-[20px] lg:text-[23px] font-bold tracking-tight text-white leading-tight line-clamp-2">
                                {snippet.title}
                            </h1>

                            {snippet.description && (
                                <p className="text-emerald-100/70 text-[13px] leading-snug line-clamp-3">
                                    {snippet.description}
                                </p>
                            )}

                            {snippet.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {snippet.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="text-[9px] font-mono px-2.5 py-0.5 bg-emerald-950 border border-emerald-500/20 text-emerald-300 rounded-full"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center gap-3 pt-2">
                                {snippet.user.avatar ? (
                                    <Image
                                        src={snippet.user.avatar}
                                        alt={snippet.user.name}
                                        width={34}
                                        height={34}
                                        className="rounded-full border border-emerald-500/30 flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                                        <FontAwesomeIcon icon={faUser} className="text-emerald-400" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium text-white text-sm">{snippet.user.name}</p>
                                    <p className="text-[10px] text-emerald-100/60">{formattedDate}</p>
                                </div>
                            </div>

                            <p className="font-mono text-[10px] text-emerald-100/50">
                                {copyCount.toLocaleString("id-ID")} kali disalin
                            </p>
                        </div>

                        <div className="hidden lg:block mt-auto pt-8">
                            <Link
                                href={session ? "/dashboard" : "/"}
                                className="group flex items-center justify-between bg-emerald-500 hover:bg-emerald-400 transition-all 
                                        text-black font-semibold px-5 py-3 rounded-2xl text-sm w-full"
                            >
                                <span>{session ? "Masuk ke Dashboard" : "Gabung ke Devnote"}</span>
                                <FontAwesomeIcon 
                                    icon={faArrowRight} 
                                    className="group-hover:translate-x-1 transition-transform" 
                                />
                            </Link>
                        </div>

                        <a href="https://github.com/Mufacoderz" target="_blank" 
                        className="text-emerald-100/40 text-[10px] text-center mt-6 lg:mt-8">
                            Shared via <span className="text-emerald-400">devnote</span> — by Muhammad Fadil
                        </a>
                    </div>

                    {/* RIGHT PANEL (CODE) */}
                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

                        {/* HEADER */}
                        <div className="px-4 lg:px-8 py-3.5 border-b border-emerald-500/10 bg-[#0a0f0c] flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-3 text-xs text-emerald-100/70">
                                <div className="flex gap-1">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                                </div>
                                <span className="font-mono">
                                    {snippet.code.split("\n").length} baris • {snippet.language}
                                </span>
                            </div>

                            <button
                                onClick={handleCopy}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-xs transition-all border
                                    ${copied 
                                        ? "bg-emerald-500 text-black border-emerald-400" 
                                        : "border-emerald-500/40 hover:border-emerald-400 hover:text-white text-emerald-100"
                                    }`}
                            >
                                <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="w-3.5 h-3.5" />
                                {copied ? "Tersalin!" : "Salin"}
                            </button>
                        </div>

                        {/* CODE */}
                        <div className="flex-1 bg-[#0a0f0c] overflow-hidden relative">
                            <div className="absolute inset-0 overflow-auto px-2 sm:p-0">
                                <CodeBlock code={snippet.code} language={snippet.language} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
