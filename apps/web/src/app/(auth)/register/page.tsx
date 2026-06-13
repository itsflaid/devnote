"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {signIn} from "next-auth/react"

export default function RegisterPage() {
    const router = useRouter()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        const formData = new FormData(e.currentTarget)
        const name = formData.get("name") as string
        const email = formData.get("email") as string

        if (password !== confirm) {
            setError("Password dan konfirmasi tidak cocok")
            setLoading(false)
            return
        }

        const result = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        })

        if (!result.ok) {
            setError("Gagal registrasi")
            setLoading(false)
            return
        }

        router.push("/login")
    }

    return (
        <div className="overflow-hidden min-h-screen grid md:grid-cols-2 grid-cols-1 ">

            {/* kiri */}
            <div className="relative flex flex-col justify-center px-14 py-12 bg-[var(--em)] overflow-hidden order-2 md:order-1">
                <div className="absolute w-[400px] h-[400px] rounded-full bg-white/[0.06] -top-[100px] -right-[100px]" />
                <div className="absolute w-[300px] h-[300px] rounded-full bg-white/[0.04] -bottom-[80px] -left-[80px]" />

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-black/15 px-4 py-1.5 rounded-full font-mono text-[11px] font-medium text-black/60 tracking-[0.5px] mb-8">
                        <div className="w-[6px] h-[6px] rounded-full bg-black/35" />
                        JOIN DEVNOTE
                    </div>

                    <h2 className="text-[38px] font-bold tracking-[-1px] text-[#0a0a0a] leading-[1.15] mb-5">
                        Build your<br />
                        <span className="text-black/40">personal code</span><br />
                        library today.
                    </h2>

                    <p className="text-[15px] text-black/50 font-light leading-relaxed max-w-[340px] mb-10">
                        Every note you save is a minute saved tomorrow. Never lose good code again.
                    </p>

                </div>
            </div>

            {/* kanan */}
            <div className="flex flex-col justify-center px-14 py-12 bg-[var(--bg)] relative overflow-hidden order-1 md:order-2">
                <div className="absolute inset-0 opacity-40"
                    style={{
                        backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />

                <div className="relative z-10 ml-0 md:ml-28 max-w-[360px]">
                    <Link href="/" className="flex flex-col gap-1 mb-5 w-fit group">
                        <div className="flex items-center gap-2">
                            <Image
                                src="/emerald-trans-bg.png"
                                alt="devnote"
                                width={45}
                                height={45}
                            />
                            <span className="text-[15px] font-semibold tracking-tight">
                                dev<span className="text-[var(--em)]">note</span>
                            </span>
                        </div>
                        <span className="text-[11px] text-[var(--text4)] group-hover:text-[var(--em)] transition-all flex items-center gap-1 pl-[2px]">
                            ← kembali
                        </span>
                    </Link>

                    <h1 className="text-[32px] font-bold tracking-[-0.8px] leading-[1.1] mb-2">
                        Create your<br />account.
                    </h1>
                    <p className="text-[14px] text-[var(--text2)] font-light mb-5 leading-relaxed">
                        Start your personal code library.<br />Free, forever.
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11.5px] font-medium text-[var(--text2)] tracking-[0.2px]">Nama</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Your name"
                                required
                                className="bg-[var(--surface)] border border-[var(--border2)] rounded-lg px-3.5 py-3 text-[14px] text-[var(--text)] placeholder:text-[var(--text3)] outline-none focus:border-[var(--em-dim)] focus:shadow-[0_0_0_3px_var(--em-faint)] transition-all"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11.5px] font-medium text-[var(--text2)] tracking-[0.2px]">Email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="you@email.com"
                                required
                                className="bg-[var(--surface)] border border-[var(--border2)] rounded-lg px-3.5 py-3 text-[14px] text-[var(--text)] placeholder:text-[var(--text3)] outline-none focus:border-[var(--em-dim)] focus:shadow-[0_0_0_3px_var(--em-faint)] transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11.5px] font-medium text-[var(--text2)] tracking-[0.2px]">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-[var(--surface)] border border-[var(--border2)] rounded-lg px-3.5 py-3 text-[14px] text-[var(--text)] placeholder:text-[var(--text3)] outline-none focus:border-[var(--em-dim)] focus:shadow-[0_0_0_3px_var(--em-faint)] transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11.5px] font-medium text-[var(--text2)] tracking-[0.2px]">Konfirmasi</label>
                                <input
                                    type="password"
                                    name="confirm"
                                    placeholder="••••••••"
                                    onChange={(e) => setConfirm(e.target.value)}
                                    required
                                    className="bg-[var(--surface)] border border-[var(--border2)] rounded-lg px-3.5 py-3 text-[14px] text-[var(--text)] placeholder:text-[var(--text3)] outline-none focus:border-[var(--em-dim)] focus:shadow-[0_0_0_3px_var(--em-faint)] transition-all"
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-[12px] text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[var(--em)] text-[#0a0a0a] font-semibold text-[14px] py-3 rounded-lg hover:bg-[#2bc48a] hover:shadow-[0_4px_24px_var(--em-glow)] hover:-translate-y-[1px] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                        >
                            {loading ? "Creating account..." : "Create Account"}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-[var(--em-dim)]" />
                        <span className="text-[11px] text-[var(--em-dim)] tracking-[0.3px] ">atau masuk dengan</span>
                        <div className="flex-1 h-px bg-[var(--em-dim)]" />
                    </div>

                    {/* OAuth Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => signIn("google", {callbackUrl: "/dashboard"})}
                            className="flex items-center justify-center gap-2.5 bg-[var(--surface)] border border-[var(--border2)] rounded-lg py-2.5 text-[13px] font-medium text-[var(--text2)] hover:border-red-500 hover:text-[var(--text)] transition-all"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </button>

                        <button
                            type="button"
                            onClick={() => { }}
                            className="flex items-center justify-center gap-2.5 bg-[var(--surface)] border border-[var(--border2)] rounded-lg py-2.5 text-[13px] font-medium text-[var(--text2)] hover:border-blue-500 hover:text-[var(--text)] transition-all"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                            </svg>
                            GitHub
                        </button>
                    </div>

                    <p className="text-[13px] text-[var(--text2)] text-center mt-6">
                        Sudah punya akun?{" "}
                        <Link href="/login" className="text-[var(--em)] hover:underline font-medium">
                            Masuk
                        </Link>
                    </p>

                </div>
            </div>

        </div>
    )
}
