"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass, faUser, faTimes } from "@fortawesome/free-solid-svg-icons"
import { useDebouncedCallback } from "use-debounce"

interface ExploreTopbarProps {
    search: string
    onSearch: (val: string) => void
}

export default function ExploreTopbar({ search, onSearch }: ExploreTopbarProps) {
    const { data: session } = useSession()
    const router = useRouter()

    const [inputVal, setInputVal] = useState(search)
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const pushDebounced = useDebouncedCallback((val: string) => {
        onSearch(val)
    }, 400)

    const handleChange = (val: string) => {
        setInputVal(val)
        pushDebounced(val)
    }

    useEffect(() => {
        if (mobileSearchOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [mobileSearchOpen])

    const closeMobileSearch = () => setMobileSearchOpen(false)

    const handleProfileClick = () => router.push("/dashboard")

    return (
        <header className="fixed top-0 left-0 right-0 h-[52px] z-50 
            bg-black/95 backdrop-blur-xl border-b border-white/10 
            flex items-center px-5">

            <div className="flex items-center justify-between w-full max-w-7xl mx-auto">

                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative w-7 h-7">
                        <Image
                            src="/emerald-trans-bg.png"
                            alt="devnote"
                            width={55}
                            height={55}
                            className="transition-transform duration-300 group-hover:scale-110"
                            priority
                        />
                    </div>
                    <span className="text-[15px] font-semibold tracking-tighter text-white">
                        dev<span className="text-emerald-400">note</span>
                    </span>
                </Link>

                <div className="hidden md:block flex-1 max-w-md mx-6">
                    <div className="relative">
                        <input
                            type="text"
                            value={inputVal}
                            onChange={(e) => handleChange(e.target.value)}
                            placeholder="Cari note publik..."
                            className="w-full 
                bg-[var(--surface2)] 
                border border-[var(--border2)] 
                focus:border-[var(--em)] 
                rounded-full 
                px-4 py-[6px] 
                pl-9 
                text-[13px] 
                text-[var(--text)] 
                placeholder:text-[var(--text4)] 
                outline-none 
                transition-all"
                        />
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text4)] w-4 h-4"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">

                    <button
                        onClick={() => setMobileSearchOpen(true)}
                        className="md:hidden w-[32px] h-[32px] flex items-center justify-center 
                            text-[var(--text3)] hover:bg-[var(--surface2)] hover:text-[var(--text)] rounded-2xl transition-all"
                    >
                        <FontAwesomeIcon icon={faMagnifyingGlass} className="w-5 h-5" />
                    </button>

                    {session?.user ? (
                        <button
                            onClick={handleProfileClick}
                            className="w-8 h-8 rounded-full overflow-hidden border border-[var(--border)] 
                                hover:border-[var(--em)] transition-all active:scale-95"
                            title="Dashboard"
                        >
                            <Image
                                src={session.user.image || "/default-avatar.png"}
                                alt={session.user.name || "Profile"}
                                width={40}
                                height={40}
                                className="object-cover w-full h-full"
                            />
                        </button>
                    ) : (
                        <button
                            onClick={handleProfileClick}
                            className=" sm:hidden w-10 h-10 flex items-center justify-center 
                                bg-emerald-500 hover:bg-emerald-400 
                                text-black rounded-full 
                                transition-all active:scale-95"
                            title="Masuk ke Dashboard"
                        >
                            <FontAwesomeIcon icon={faUser} className="w-5 h-5" />
                        </button>
                    )}

                    {/* Login & Register (hanya jika belum login) */}
                    {!session?.user && (
                        <div className="hidden sm:flex items-center gap-2">
                            <Link
                                href="/login"
                                className="text-sm text-zinc-400 hover:text-white px-4 py-2 transition-all"
                            >
                                Masuk
                            </Link>
                            <Link
                                href="/register"
                                className="bg-emerald-500 hover:bg-emerald-400 
                                    text-black font-semibold text-sm 
                                    px-5 py-2.5 rounded-2xl transition-all active:scale-95"
                            >
                                Daftar
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Search Modal */}
            {mobileSearchOpen && (
                <div className="fixed inset-0 bg-black/95 z-[60] md:hidden flex flex-col ">
                    <div className="h-[52]  border-white/10 flex items-center px-4">
                        <div className="flex-1 relative mt-[5px]">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputVal}
                                onChange={(e) => handleChange(e.target.value)}
                                placeholder="Cari note publik..."
                                className="w-full bg-zinc-900 border border-zinc-700 focus:border-emerald-500 rounded-2xl px-5 py-[7px] pl-12 text-white placeholder:text-zinc-500 outline-none"
                            />
                            <FontAwesomeIcon
                                icon={faMagnifyingGlass}
                                className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-400 w-5 h-5"
                            />
                        </div>
                        <button
                            onClick={closeMobileSearch}
                            className="ml-4 w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white"
                        >
                            <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
        </header>
    )
}
