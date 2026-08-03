import Link from "next/link"
import Image from "next/image"

export default function NotFound() {
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

                    <div className="absolute inset-0 rounded-full bg-[var(--em)] overflow-hidden">
                        <div className="absolute w-[200px] h-[200px]  rounded-full bg-black/[0.08] -top-[40px] -right-[40px]" />
                        <div className="absolute w-[180px] h-[180px] rounded-full bg-black/[0.08] bottom-[-30px] left-[20px]" />
                    </div>

                    <div className="absolute inset-0 rounded-full bg-[var(--em)] blur-[120px] opacity-40 scale-110" />


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

                <h1 className="text-[70px] font-bold tracking-[-2px] text-[#0a0a0a] leading-none mb-3">
                    404
                </h1>

                <h2 className="text-[22px] font-semibold text-black/70 mb-3">
                    Halaman tidak ditemukan
                </h2>

                <p className="text-[14px] text-black/50 font-light leading-relaxed max-w-[340px] mb-10">
                    Sepertinya halaman yang kamu cari tidak ada atau sudah dipindahkan.
                </p>

                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        className="px-7 py-3 rounded-lg bg-[#0a0a0a] text-white font-semibold text-[14px] hover:bg-[#1c1c1c] transition-all shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                    >
                        Kembali ke Home
                    </Link>

                </div>

            </div>
        </div>
    )
}