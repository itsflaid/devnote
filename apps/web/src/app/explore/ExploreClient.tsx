"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import ExploreSnippetCard, { PublicSnippet } from "@/components/explore/ExploreSnippetCard"
import ExplorePagination from "@/components/explore/ExplorePagination"
import ExploreTopbar from "@/components/explore/ExploreTopbar"
import ExploreHero from "@/components/explore/ExploreHero"

import { languages } from "@/lib/languages"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSliders, faTimes } from "@fortawesome/free-solid-svg-icons"

const SORT_FILTERS = [
    { label: "Terbaru", value: "newest" },
    { label: "Terlama", value: "oldest" },
    { label: "Populer", value: "popular" },
    { label: "Paling Banyak Dicopy", value: "most-copied" },
]

const LANG_FILTERS = [
    { label: "Semua Bahasa", value: "" },
    ...Object.entries(languages)
        .filter(([key]) => key !== "other")
        .map(([key, config]) => ({
            label: config.label === "?" ? "Lainnya" : `${config.label} - ${key.charAt(0).toUpperCase() + key.slice(1)}`,
            value: key,
        }))
]

export default function ExploreClient() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [, startTransition] = useTransition()

    

    const [sort, setSort] = useState(searchParams.get("sort") ?? "newest")
    const [lang, setLang] = useState(searchParams.get("lang") ?? "")
    const [search, setSearch] = useState(searchParams.get("search") ?? "")
    const [page, setPage] = useState(Number(searchParams.get("page") ?? "1"))

    const [snippets, setSnippets] = useState<PublicSnippet[]>([])
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(true)

    const [showMobileFilter, setShowMobileFilter] = useState(false)

    const pushParams = useCallback((overrides: Record<string, string>) => {
        const params = new URLSearchParams()
        const merged = { sort, lang, search, page: String(page), ...overrides }

        if (merged.sort && merged.sort !== "newest") params.set("sort", merged.sort)
        if (merged.lang) params.set("lang", merged.lang)
        if (merged.search) params.set("search", merged.search)
        if (merged.page && merged.page !== "1") params.set("page", merged.page)

        startTransition(() => {
            router.replace(`/explore?${params.toString()}`, { scroll: false })
        })
    }, [sort, lang, search, page, router])

    const fetchSnippets = useCallback(async (params: {
        sort: string; lang: string; search: string; page: number
    }) => {
        setLoading(true)
        try {
            const q = new URLSearchParams()
            q.set("sort", params.sort)
            if (params.lang) q.set("lang", params.lang)
            if (params.search) q.set("search", params.search)
            q.set("page", String(params.page))

            const res = await fetch(`/api/explore?${q.toString()}`)
            const data = await res.json()

            setSnippets(data.snippets || [])
            setTotal(data.total || 0)
            setTotalPages(data.totalPages || 1)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchSnippets({ sort, lang, search, page })
    }, [sort, lang, search, page, fetchSnippets])

    // Handlers
    const handleSort = (val: string) => {
        setSort(val)
        setPage(1)
        pushParams({ sort: val, page: "1" })
        setShowMobileFilter(false)
    }

    const handleLang = (val: string) => {
        setLang(val)
        setPage(1)
        pushParams({ lang: val, page: "1" })
        setShowMobileFilter(false)
    }

    const handleSearch = (val: string) => {
        setSearch(val)
        setPage(1)
        pushParams({ search: val, page: "1" })
    }

    const handlePage = (val: number) => {
        setPage(val)
        pushParams({ page: String(val) })
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const handleLikeToggle = (id: number, liked: boolean, count: number) => {
        setSnippets(prev =>
            prev.map(s => s.id === id ? { ...s, likedByMe: liked, likeCount: count } : s)
        )
    }

    return (
        <div className="min-h-screen flex flex-col pt-16">

            <ExploreTopbar search={search} onSearch={handleSearch} />

            <ExploreHero total={total} loading={loading} />

            <div className="max-w-5xl mx-auto w-full px-5 py-8 flex-1">

                <div className="flex items-center justify-between mb-6">

                    <div className="hidden sm:flex items-center gap-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1">
                        {SORT_FILTERS.map(f => (
                            <button
                                key={f.value}
                                onClick={() => handleSort(f.value)}
                                className={`text-[13px] px-4 py-1.5 rounded-lg transition-all font-medium ${sort === f.value
                                    ? "bg-[var(--em-faint)] text-[var(--em)] border border-[var(--em-border)]"
                                    : "text-[var(--text3)] hover:text-[var(--text)]"
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setShowMobileFilter(true)}
                        className="sm:hidden flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface2)] transition-all"
                    >
                        <FontAwesomeIcon icon={faSliders} className="w-4 h-4" />
                        Filter
                        <span className="text-[var(--text3)] text-xs ml-1">
                            ({SORT_FILTERS.find(f => f.value === sort)?.label})
                        </span>
                    </button>

                    <div className="hidden sm:flex items-center gap-3">
                        <span className="text-[12px] text-[var(--text3)] font-medium whitespace-nowrap">
                            Bahasa:
                        </span>
                        <select
                            value={lang}
                            onChange={(e) => handleLang(e.target.value)}
                            className="bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[var(--em-border)] cursor-pointer transition-all min-w-[180px]"
                        >
                            {LANG_FILTERS.map(f => (
                                <option key={f.value} value={f.value}>
                                    {f.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {!loading && (
                    <div className="mb-4 text-right">
                        <span className="text-[12px] text-[var(--text3)] font-mono">
                            {total.toLocaleString()} note ditemukan
                        </span>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col gap-4">
                        {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : snippets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-12 h-12 rounded-xl bg-[var(--surface2)] border border-[var(--border)] flex items-center justify-center mb-4">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="1.5">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </div>
                        <div className="text-[14px] font-medium text-[var(--text2)] mb-1">Tidak ada note ditemukan</div>
                        <div className="text-[12px] text-[var(--text3)]">Coba ubah filter atau kata kunci pencarian</div>
                    </div>
                ) : (
                    <AnimatePresence>

                        <div className="flex flex-col gap-4" >
                            {snippets.map((s) => (
                                <motion.div
                                    key={s.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                >
                                    <ExploreSnippetCard
                                        snippet={s}
                                        onLikeToggle={handleLikeToggle}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>
                )}

                <ExplorePagination page={page} totalPages={totalPages} onChange={handlePage} />
            </div>

            <AnimatePresence>
                {showMobileFilter && (
                    <motion.div className="fixed inset-0 sm:hidden z-[70] ">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className=" absolute inset-0 bg-black/80  flex items-end " />


                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 20,
                            }}
                            className="absolute bottom-0 left-0 right-0 bg-[var(--surface)] w-full rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto z-[71]">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold">Urutkan & Filter</h3>
                                <button
                                    onClick={() => setShowMobileFilter(false)}
                                    className="w-10 h-10 flex items-center justify-center text-[var(--text3)] hover:text-white"
                                >
                                    <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Sort Options */}
                            <motion.div

                                className="mb-8">
                                <p className="text-[var(--text3)] text-sm mb-3 font-medium">Urutkan Berdasarkan</p>
                                <div className="flex flex-col gap-2">
                                    {SORT_FILTERS.map(f => (
                                        <button
                                            key={f.value}
                                            onClick={() => handleSort(f.value)}
                                            className={`w-full text-left px-5 py-3.5 rounded-2xl transition-all text-[15px] font-medium
                                            ${sort === f.value
                                                    ? "bg-[var(--em-faint)] text-[var(--em)] border border-[var(--em-border)]"
                                                    : "bg-[var(--surface2)] hover:bg-[var(--surface3)]"
                                                }`}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Language Filter di Modal */}
                            <div>
                                <p className="text-[var(--text3)] text-sm mb-3 font-medium">Bahasa</p>
                                <select
                                    value={lang}
                                    onChange={(e) => handleLang(e.target.value)}
                                    className="w-full bg-[var(--surface2)] border border-[var(--border)] text-[var(--text)] rounded-2xl px-5 py-3.5 text-base focus:outline-none focus:border-[var(--em-border)]"
                                >
                                    {LANG_FILTERS.map(f => (
                                        <option key={f.value} value={f.value}>
                                            {f.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


            <footer className="border-t border-[var(--border)] bg-[var(--surface)] mt-auto">
                <div className="max-w-5xl mx-auto px-5 py-10">
                    <div className="flex flex-col md:flex-row justify-between gap-8">
                        <div className="max-w-[220px]">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-[15px] font-semibold tracking-tight">
                                    dev<span className="text-[var(--em)]">note</span>
                                </span>
                            </div>
                            <p className="text-[11px] text-[var(--text3)] leading-relaxed">
                                Platform untuk menyimpan, berbagi, dan menemukan note kode terbaik untuk developer.
                            </p>
                        </div>

                        <div className="flex gap-12">
                            <div>
                                <div className="text-[11px] font-semibold text-[var(--text2)] mb-3 uppercase tracking-wider">Platform</div>
                                <div className="flex flex-col gap-2">
                                    {["Explore", "Dashboard", "Tags"].map(l => (
                                        <a key={l} href="#" className="text-[12px] text-[var(--text3)] hover:text-[var(--em)] transition-all">{l}</a>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="text-[11px] font-semibold text-[var(--text2)] mb-3 uppercase tracking-wider">Legal</div>
                                <div className="flex flex-col gap-2">
                                    {["Privacy Policy", "Terms of Service"].map(l => (
                                        <a key={l} href="#" className="text-[12px] text-[var(--text3)] hover:text-[var(--em)] transition-all">{l}</a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-[var(--border)] flex items-center justify-between">
                        <div className="text-[11px] text-[var(--text3)]">
                            © 2026 DevNote. All rights reserved.
                        </div>
                        <div className="text-[11px] text-[var(--text3)]">
                            By Muhammad Fadil
                        </div>
                    </div>
                </div>
            </footer>

        </div>
    )
}

// SkeletonCard
function SkeletonCard() {
    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 animate-pulse">
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--surface3)]" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[var(--surface3)] rounded w-2/5" />
                    <div className="h-3 bg-[var(--surface3)] rounded w-3/5" />
                </div>
                <div className="w-24 h-7 bg-[var(--surface3)] rounded-lg" />
            </div>
            <div className="flex gap-2">
                {[40, 55, 35].map(w => (
                    <div key={w} className="h-5 bg-[var(--surface3)] rounded-full" style={{ width: w }} />
                ))}
            </div>
            <div className="flex items-center justify-between mt-4">
                <div className="flex gap-3">
                    <div className="h-6 w-14 bg-[var(--surface3)] rounded-lg" />
                    <div className="h-6 w-10 bg-[var(--surface3)] rounded-lg" />
                </div>
                <div className="h-6 w-20 bg-[var(--surface3)] rounded-lg" />
            </div>
        </div>
    )
}
