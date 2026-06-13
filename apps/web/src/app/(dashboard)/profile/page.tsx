"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faCheck, faTriangleExclamation, faPen } from "@fortawesome/free-solid-svg-icons"
import Image from "next/image"
import { getLang } from "@/lib/languages"

interface Stats {
    totalSnippets: number
    totalFavorites: number
    totalPublic: number
    totalCopies: number
    totalCollections: number
    totalLanguages: number
    totalTags: number
    topLanguages: { name: string; count: number }[]
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
    return (
        <div className="border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--surface)]">
                <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[var(--text4)]">{title}</p>
                {description && <p className="text-[11px] text-[var(--text4)] mt-0.5">{description}</p>}
            </div>
            <div className="bg-[var(--bg)] divide-y divide-[var(--border)]">
                {children}
            </div>
        </div>
    )
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between px-5 py-4 gap-4">
            <div>
                <p className="text-[13px] font-medium text-[var(--text)]">{label}</p>
                {description && <p className="text-[11px] text-[var(--text4)] mt-0.5">{description}</p>}
            </div>
            <div className="shrink-0">{children}</div>
        </div>
    )
}

function InputField({ label, type = "text", placeholder, defaultValue, disabled }: {
    label: string
    type?: string
    placeholder?: string
    defaultValue?: string
    disabled?: boolean
}) {
    return (
        <div className="px-5 py-4 flex flex-col gap-1.5">
            <label className="text-[11.5px] font-medium text-[var(--text2)]">{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                defaultValue={defaultValue}
                disabled={disabled}
                className="bg-[var(--surface)] border border-[var(--border2)] rounded-lg px-3.5 py-2.5 text-[13px] text-[var(--text)] placeholder:text-[var(--text3)] outline-none focus:border-[var(--em-dim)] focus:shadow-[0_0_0_3px_var(--em-faint)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
        </div>
    )
}

function StatCard({ val, label }: { val: string | number; label: string }) {
    return (
        <div className="bg-[var(--surface2)] border border-[var(--border)] rounded-[8px] p-3 flex flex-col gap-1">
            <span className="font-mono text-[18px] font-semibold text-[var(--em)] leading-none">{val}</span>
            <span className="text-[10px] text-[var(--text3)]">{label}</span>
        </div>
    )
}

export default function ProfilePage() {
    const { data: session } = useSession()
    const router = useRouter()
    const [saved, setSaved] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [stats, setStats] = useState<Stats | null>(null)

    const user = session?.user

    useEffect(() => {
        fetch("/api/user/stats")
            .then(r => r.json())
            .then(setStats)
            .catch(console.error)
    }, [])

    function getInitials(name?: string | null) {
        if (!name) return "U"
        const words = name.trim().split(" ")
        if (words.length === 1) return words[0][0].toUpperCase()
        return (words[0][0] + words[words.length - 1][0]).toUpperCase()
    }

    const handleSave = () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    return (
        <div className="max-w-[640px] mx-auto px-6 py-8 flex flex-col gap-6">

            <div className="flex items-center gap-3 mb-2">
                <button
                    onClick={() => router.back()}
                    className="w-[32px] h-[32px] flex items-center justify-center rounded-lg text-[var(--text3)] hover:bg-[var(--surface2)] hover:text-[var(--text)] transition-all"
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="w-[13px] h-[13px]" />
                </button>
                <h1 className="text-[20px] font-bold tracking-[-0.5px]">Edit Profil</h1>
            </div>

            <div className="flex flex-col items-center gap-3 py-6">
                <div className="relative group">
                    {user?.image ? (
                        <Image
                            src={user.image}
                            alt="avatar"
                            width={96}
                            height={96}
                            referrerPolicy="no-referrer"
                            className="rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-[96px] h-[96px] rounded-full bg-gradient-to-br from-[var(--em-dim)] to-[var(--em)] flex items-center justify-center text-[#0a0a0a] text-[28px] font-bold">
                            {getInitials(user?.name)}
                        </div>
                    )}
                    <button className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <FontAwesomeIcon icon={faPen} className="w-[16px] h-[16px] text-white" />
                    </button>
                    <button className="absolute bottom-0 right-0 w-[28px] h-[28px] rounded-full bg-[var(--em)] border-2 border-[var(--bg)] flex items-center justify-center text-[#0a0a0a] hover:bg-[#2bc48a] transition-all">
                        <FontAwesomeIcon icon={faPen} className="w-[10px] h-[10px]" />
                    </button>
                </div>
                <div className="text-center">
                    <p className="text-[15px] font-semibold text-[var(--text)]">{user?.name}</p>
                    <p className="text-[12px] text-[var(--text4)]">{user?.email}</p>
                </div>
            </div>

            <Section title="Statistik">
                <div className="px-5 py-4 flex flex-col gap-4">
                    <div className="grid grid-cols-4 gap-2">
                        <StatCard val={stats?.totalSnippets ?? "—"} label="Notes" />
                        <StatCard val={stats?.totalCollections ?? "—"} label="Collections" />
                        <StatCard val={stats?.totalLanguages ?? "—"} label="Bahasa" />
                        <StatCard val={stats?.totalTags ?? "—"} label="Tags" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <StatCard val={stats?.totalFavorites ?? "—"} label="Favorit" />
                        <StatCard val={stats?.totalCopies ?? "—"} label="Total Disalin" />
                        <StatCard val={stats?.totalPublic ?? "—"} label="Publik" />
                    </div>

                    {stats?.topLanguages && stats.topLanguages.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <p className="text-[11px] font-medium text-[var(--text4)] uppercase tracking-[1px]">
                                Bahasa yang digunakan
                            </p>
                            <div className="flex flex-col gap-1.5">
                                {stats.topLanguages.map(({ name, count }) => {
                                    const lang = getLang(name)
                                    const pct = Math.round((count / (stats.totalSnippets || 1)) * 100)
                                    return (
                                        <div key={name} className="flex items-center gap-3">
                                            <div
                                                className="w-[8px] h-[8px] rounded-full shrink-0"
                                                style={{ background: lang.color }}
                                            />
                                            <span className="text-[12px] text-[var(--text2)] w-[80px] capitalize">{name}</span>
                                            <div className="flex-1 h-[4px] bg-[var(--surface3)] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${pct}%`, background: lang.color }}
                                                />
                                            </div>
                                            <span className="font-mono text-[11px] text-[var(--text4)] w-[32px] text-right">{count}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </Section>

            <Section title="Informasi Akun">
                <InputField label="Nama" placeholder="Nama kamu" defaultValue={user?.name ?? ""} />
                <InputField label="Email" type="email" placeholder="email@kamu.com" defaultValue={user?.email ?? ""} />
            </Section>

            <Section title="Ganti Password">
                <InputField label="Password Lama" type="password" placeholder="••••••••" />
                <InputField label="Password Baru" type="password" placeholder="••••••••" />
                <InputField label="Konfirmasi Password Baru" type="password" placeholder="••••••••" />
            </Section>

            <button
                onClick={handleSave}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-[14px] transition-all
                    ${saved
                        ? 'bg-[var(--em-faint)] text-[var(--em)] border border-[var(--em-border)]'
                        : 'bg-[var(--em)] text-[#0a0a0a] hover:bg-[#2bc48a] hover:shadow-[0_4px_24px_var(--em-glow)]'
                    }`}
            >
                {saved && <FontAwesomeIcon icon={faCheck} className="w-[12px] h-[12px]" />}
                {saved ? "Tersimpan!" : "Simpan Perubahan"}
            </button>

            {/* Danger Zone */}
            <Section title="Danger Zone">
                <Row
                    label="Hapus Akun"
                    description="Semua note, collection, dan data akan dihapus permanen"
                >
                    <button
                        onClick={() => setConfirmDelete(true)}
                        className="text-[12px] font-medium px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 transition-all"
                    >
                        Hapus Akun
                    </button>
                </Row>
            </Section>

            {/* Confirm Delete Modal */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="flex flex-col gap-4 rounded-xl p-6 w-full max-w-sm bg-[var(--surface)] border border-[var(--border)] shadow-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-[36px] h-[36px] rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                                <FontAwesomeIcon icon={faTriangleExclamation} className="w-[14px] h-[14px] text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-[15px] font-semibold">Hapus akun?</h3>
                                <p className="text-[12px] text-[var(--text3)]">Tindakan ini tidak bisa dibatalkan</p>
                            </div>
                        </div>
                        <p className="text-[13px] text-[var(--text3)] leading-relaxed">
                            Semua note, collection, dan data akunmu akan dihapus permanen dari server.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setConfirmDelete(false)}
                                className="px-4 py-2 rounded-lg text-[13px] border border-[var(--border)] text-[var(--text3)] hover:bg-[var(--surface2)] transition-all"
                            >
                                Batal
                            </button>
                            <button className="px-4 py-2 rounded-lg text-[13px] font-medium bg-red-500 hover:bg-red-600 text-white transition-all">
                                Ya, Hapus Akun
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
