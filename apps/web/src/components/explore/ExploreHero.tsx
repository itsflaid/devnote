"use client"

import { useEffect, useRef } from "react"
import { TOTAL_LANGUAGES } from "@/lib/languages"

interface ExploreHeroProps {
    total: number
    loading: boolean
}

export default function ExploreHero({ total, loading }: ExploreHeroProps) {
    const typedRef = useRef<HTMLSpanElement>(null)
    const statsRef = useRef<HTMLDivElement>(null)
    const triggered = useRef(false)

    useEffect(() => {
        const phrases = ["Publik Terbaik.", "dari Komunitas.", "yang Menginspirasi.", "Siap Dipakai."]
        let pi = 0, ci = 0, deleting = false
        let timer: ReturnType<typeof setTimeout>

        function type() {
            const el = typedRef.current
            if (!el) return
            const phrase = phrases[pi]

            if (!deleting) {
                el.textContent = phrase.slice(0, ci + 1)
                ci++
                if (ci === phrase.length) {
                    deleting = true
                    timer = setTimeout(type, 1800)
                    return
                }
            } else {
                el.textContent = phrase.slice(0, ci - 1)
                ci--
                if (ci === 0) {
                    deleting = false
                    pi = (pi + 1) % phrases.length
                }
            }
            timer = setTimeout(type, deleting ? 45 : 80)
        }

        timer = setTimeout(type, 600)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (loading || triggered.current) return
        const el = statsRef.current
        if (!el) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return
                triggered.current = true
                observer.disconnect()

                el.style.transition = "opacity 0.6s ease, transform 0.6s ease"
                el.style.opacity = "1"
                el.style.transform = "translateY(0)"

                function countUp(
                    domEl: HTMLElement,
                    target: number | string,
                    duration: number
                ) {
                    const start = performance.now()
                    const isK = typeof target === "string"
                    const num = isK ? parseFloat(target as string) : (target as number)

                    function update(now: number) {
                        const p = Math.min((now - start) / duration, 1)
                        const eased = 1 - Math.pow(1 - p, 3)
                        if (isK) {
                            domEl.textContent = (eased * num).toFixed(1) + "K"
                        } else {
                            domEl.textContent = Math.round(eased * num).toLocaleString()
                        }
                        if (p < 1) {
                            requestAnimationFrame(update)
                        } else {
                            domEl.textContent = isK
                                ? target + "K"
                                : (num).toLocaleString()
                        }
                    }
                    requestAnimationFrame(update)
                }

                setTimeout(() => {
                    const s = el.querySelector<HTMLElement>("#stat-snippets")
                    const d = el.querySelector<HTMLElement>("#stat-devs")
                    const l = el.querySelector<HTMLElement>("#stat-langs")
                    if (s) countUp(s, total, 1800)
                    if (d) countUp(d, "1.2", 1600)
                    if (l) countUp(l, TOTAL_LANGUAGES, 1400)
                }, 150)
            },
            { threshold: 0.4 }
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [loading, total])

    return (
        <section className="relative overflow-hidden border-b border-[#0d2818] bg-[#0a0a0a] flex items-center justify-center h-screen">

            <div
                className="absolute inset-0 opacity-35"
                style={{
                    backgroundImage: `linear-gradient(#1c3a28 1px, transparent 1px), linear-gradient(90deg, #1c3a28 1px, transparent 1px)`,
                    backgroundSize: "40px 40px",
                }}
            />

            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[320px] rounded-full pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse at center, rgba(16,185,129,0.18) 0%, rgba(16,185,129,0.06) 45%, transparent 70%)",
                }}
            />
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[160px] rounded-full pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse at center, rgba(52,211,153,0.13) 0%, transparent 70%)",
                }}
            />

            <div className="absolute w-[320px] h-[320px] rounded-full bg-white/[0.025] -top-[100px] -left-[80px]" />
            <div className="absolute w-[240px] h-[240px] rounded-full bg-white/[0.02] -bottom-[70px] -right-[60px]" />

            <div className="relative z-10 text-center px-6 py-12 max-w-[900px] w-full">

                <h1 className="text-[55px] lg:text-[80px] font-bold text-white tracking-[-2.5px] leading-[1.1] mb-2">
                    Jelajahi Note
                </h1>

                <div className="text-[55px] lg:text-[80px] font-bold tracking-[-2.5px] leading-[1.1] mb-6 min-h-[1.2em]">
                    <span
                        ref={typedRef}
                        className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-300 bg-clip-text text-transparent"
                    />
                    <span className="inline-block w-[4px] h-[0.9em] bg-emerald-400 ml-2 align-middle rounded-sm animate-pulse" />
                </div>

                <p className="text-[16px] text-emerald-100/50 font-light leading-relaxed max-w-[480px] mx-auto mb-10">
                    Temukan ribuan potongan kode berkualitas dari developer Indonesia dan dunia. Gratis, selamanya.
                </p>

                <div
                    ref={statsRef}
                    style={{ opacity: 0, transform: "translateY(20px)" }}
                    className="inline-flex items-center justify-center gap-6 md:gap-8
                    bg-white/[0.03] border border-emerald-500/[0.12]
                    rounded-2xl px-6 md:px-9 py-4 md:py-5 w-full max-w-md mx-auto"
                >
                    <div className="text-center flex-1 min-w-0">
                        <div
                            id="stat-snippets"
                            className="text-[26px] md:text-[28px] font-semibold text-white font-mono tracking-tight"
                        >
                            0
                        </div>
                        <div className="text-[10px] md:text-[11px] text-emerald-400/60 mt-1 whitespace-nowrap">
                            Note Publik
                        </div>
                    </div>

                    <div className="w-px h-8 md:h-9 bg-emerald-500/15" />

                    <div className="text-center flex-1 min-w-0">
                        <div
                            id="stat-devs"
                            className="text-[26px] md:text-[28px] font-semibold text-white font-mono tracking-tight"
                        >
                            0
                        </div>
                        <div className="text-[10px] md:text-[11px] text-emerald-400/60 mt-1 whitespace-nowrap">
                            Developer Aktif
                        </div>
                    </div>

                    <div className="w-px h-8 md:h-9 bg-emerald-500/15" />

                    <div className="text-center flex-1 min-w-0">
                        <div
                            id="stat-langs"
                            className="text-[26px] md:text-[28px] font-semibold text-white font-mono tracking-tight"
                        >
                            0
                        </div>
                        <div className="text-[10px] md:text-[11px] text-emerald-400/60 mt-1 whitespace-nowrap">
                            Bahasa
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
