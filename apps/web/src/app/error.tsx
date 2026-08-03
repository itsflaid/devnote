"use client"

import { useEffect } from "react"
import Image from "next/image"

export default function Error({ error }: { error: Error }) {
    useEffect(() => {
        console.error(error)
    }, [error])

    const handleRetry = () => {
        window.location.reload()
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#0a0a0a] flex items-center justify-center">

            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
                    backgroundSize: "40px 40px",
                    opacity: 0.4,
                }}
            />

            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-[450px] h-[450px]">

                    <div
                        className="absolute inset-0 bg-[var(--em)]"
                        style={{
                            clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)"
                        }}
                    >
                        <div className="absolute w-[200px] h-[200px] rounded-full bg-black/[0.08] -top-[40px] -right-[40px]" />
                        <div className="absolute w-[180px] h-[180px] rounded-full bg-black/[0.08] bottom-[-30px] left-[20px]" />
                    </div>



                </div>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-[500px]">

                <Image
                    src="/black-trans.png"
                    alt="devnote"
                    width={52}
                    height={52}
                    className="mb-6"
                />

                <p className="font-mono text-[11px] text-black/40 tracking-[3px] uppercase mb-5">
                    devnote
                </p>

                <h1 className="text-[60px] font-bold tracking-[-2px] text-[#0a0a0a] leading-none mb-3">
                    Error
                </h1>

                <h2 className="text-[22px] font-semibold text-black/70 mb-3">
                    Terjadi gangguan
                </h2>

                <p className="text-[14px] text-black/50 font-light leading-relaxed max-w-[340px] mb-10">
                    Layanan sedang tidak dapat digunakan sementara waktu.
                    Silakan coba lagi.
                </p>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRetry}
                        className="px-7 py-3 rounded-lg bg-[#0a0a0a] text-white font-semibold text-[14px] hover:bg-[#1c1c1c] transition-all shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                    >
                        Coba lagi
                    </button>
                </div>

            </div>
        </div>
    )
}