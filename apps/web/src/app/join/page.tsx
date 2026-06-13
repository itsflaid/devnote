"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default function JoinPage() {
    const router = useRouter()
    const [code, setCode] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value
            .replace(/[^A-Za-z0-9]/g, "")
            .toUpperCase()
            .slice(0, 9)

        if (val.length > 6) {
            val = `${val.slice(0, 3)}-${val.slice(3, 6)}-${val.slice(6)}`
        } else if (val.length > 3) {
            val = `${val.slice(0, 3)}-${val.slice(3)}`
        }

        setCode(val)
        if (error) setError("")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const rawCode = code.replace(/-/g, "")

        if (rawCode.length !== 9) {
            setError("Kode harus 9 karakter")
            return
        }

        setLoading(true)
        setError("")

        try {
    
            router.push(`/share/${rawCode}`)
        } catch (err) {
            console.error(err)
            setError("Terjadi kesalahan, coba lagi")
        } finally {
            setLoading(false)
        }
    }

    const filled = code.replace(/-/g, "").length
    const isDisabled = loading || filled !== 9

    return (
        <div className="min-h-screen w-screen flex items-center justify-center bg-[#0a0a0a]">

            {/* Grid background - fixed biar selalu full viewport */}
            <div
                className="fixed inset-0 opacity-50 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), 
                                     linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
                    backgroundSize: "40px 40px",
                }}
            />

            {/* Radial glow - fixed juga */}
            <div
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 pointer-events-none
                           w-[520px] h-[520px] sm:w-[620px] sm:h-[620px] lg:w-[680px] lg:h-[680px]"
                style={{
                    background: "radial-gradient(circle, #10b981 0%, transparent 65%)",
                    filter: "blur(85px)",
                }}
            />

            {/* Card wrapper */}
            <div className="relative z-10 w-full max-w-[440px] mx-auto px-4">

                <div className="bg-[#10b981] text-[#0a0a0a] rounded-3xl p-6 sm:p-8 lg:p-9 shadow-[0_20px_60px_rgba(16,185,129,0.35)]">

                    <Link href="/" className="flex flex-col gap-1 mb-6 sm:mb-8 w-fit group">
                        <div className="flex items-center gap-2">
                            <Image
                                src="/logo-bg2.png"
                                alt="devnote"
                                width={50}
                                height={50}
                            />
                            <span className="text-[15px] font-semibold tracking-tight">
                                dev<span className="text-black">note</span>
                            </span>
                        </div>
                        <span className="text-[11px] text-black/70 group-hover:text-black transition-all flex items-center gap-1 pl-[2px]">
                            ← kembali
                        </span>
                    </Link>

                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-[28px] sm:text-[32px] font-bold tracking-[-1px] leading-tight mb-1">
                            Punya kode share?
                        </h1>
                        <p className="text-black/75 text-[14px] sm:text-[14.5px]">
                            Masukkan kode 9 digit yang dibagikan temanmu
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <div className={`relative flex items-center bg-white border-2 rounded-2xl transition-all duration-200
                                ${error ? "border-red-600" : filled === 9 ? "border-black" : "border-white/80"}`}
                            >
                                <div className="pl-4 sm:pl-5 pr-3">
                                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" className="text-black/80">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </div>

                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={code}
                                    onChange={handleChange}
                                    placeholder="XXX-XXX-XXX"
                                    autoComplete="off"
                                    spellCheck={false}
                                    className="flex-1 min-w-0 bg-transparent py-4 sm:py-5 pr-4 
                                               text-[18px] sm:text-[22px] 
                                               font-mono font-bold tracking-[2px] sm:tracking-[3px] 
                                               text-black placeholder:text-black/40 outline-none"
                                />
                            </div>

                            <div className="h-[3px] bg-black/10 rounded-full mt-3 overflow-hidden">
                                <div
                                    className="h-full bg-black transition-all duration-300"
                                    style={{ width: `${(filled / 9) * 100}%` }}
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-red-700 bg-red-100/80 border border-red-200 rounded-2xl px-4 py-3 text-sm">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={isDisabled}
                            className="w-full bg-black hover:bg-zinc-900 disabled:bg-black/70 disabled:cursor-not-allowed 
                                       text-white font-semibold text-[15px] py-[16px] sm:py-[17px] rounded-2xl 
                                       transition-all duration-200 shadow-md"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Memeriksa kode...
                                </span>
                            ) : (
                                "Buka Note"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
