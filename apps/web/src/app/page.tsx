import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"

// Override metadata layout untuk homepage — lebih spesifik & keyword-rich
export const metadata: Metadata = {
    title: "Devnote — Simpan, Temukan, dan Bagikan Note Kode",

    description:
        "Devnote adalah manajer note kode pribadi untuk developer. Simpan, organisir, cari, dan bagikan note kodemu dengan mudah — semua di satu tempat.",

    keywords: [
        "code note manager",
        "code note",
        "devnote",
        "manajer kode",
        "simpan note kode",
        "developer tool indonesia",
        "code note organizer",
    ],

    alternates: {
        canonical: "/",
    },

    openGraph: {
        title: "Devnote — Simpan, Temukan, dan Bagikan Note Kode",
        description:
            "Semua note kodemu di satu tempat — terorganisir, mudah dicari, siap dipakai kapan saja.",
        url: "/",
    },

}

export default async function HomePage() {
    const session = await auth()
    if (session?.user) {
        redirect("/dashboard")
    } else {
        return <WelcomePage />
    }
}

function WelcomePage() {
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

            <div
                className="absolute inset-y-0 bg-[var(--em)]"
                style={{
                    left: "15%",
                    right: "15%",
                    clipPath: "polygon(8% 0, 100% 0, 92% 100%, 0 100%)",
                }}
            >
                <div className="absolute w-[500px] h-[500px] rounded-full bg-black/[0.04] -top-[150px] -right-[100px]" />
                <div className="absolute w-[350px] h-[350px] rounded-full bg-black/[0.04] -bottom-[100px] left-[50px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-[500px]">
                <Image
                    src="/logo-bg2.png"
                    alt="Logo Devnote"
                    width={64}
                    height={64}
                    className="mb-6"
                    priority
                />
                <p className="font-mono text-[11px] text-black/40 tracking-[3px] uppercase mb-5">
                    devnote
                </p>
                <h1 className="text-[50px] sm:text-[58px] font-bold tracking-[-2px] text-[#0a0a0a] leading-[1.05] mb-5">
                    Simpan.<br />
                    <span className="text-black/25">Temukan.</span><br />
                    Bagikan.
                </h1>
                <p className="text-[15px] text-black/50 font-light leading-relaxed max-w-[360px] mb-10">
                    Semua note kodemu di satu tempat —
                    terorganisir, mudah dicari, siap dipakai kapan saja.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-[400px]">
                    <Link
                        href="/login"
                        className="px-8 py-3.5 rounded-2xl bg-[#0a0a0a] text-white font-semibold text-[14.5px] hover:bg-zinc-900 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.25)] flex-1"
                    >
                        Masuk
                    </Link>

                    <Link
                        href="/explore"
                        className="px-8 py-3.5 rounded-2xl border border-black/25 hover:border-black/40 text-black/70 hover:text-black font-medium text-[14.5px] transition-all flex items-center justify-center gap-2 flex-1 group"
                    >
                        Jelajahi
                        <span className="group-hover:translate-x-1 transition-transform text-[13px]" aria-hidden="true">→</span>
                    </Link>
                </div>

                <Link
                    href="/join"
                    className="mt-8 text-black/60 hover:text-black text-[14px] flex items-center gap-2 transition-all hover:underline group"
                >
                    
                    Punya kode share? Klik disini
                </Link>
            </div>
        </div>
    )
}
