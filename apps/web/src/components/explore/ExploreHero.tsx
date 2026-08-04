export default function ExploreHero() {
    return (
        <section className="relative overflow-hidden border-b border-[#0d2818] bg-[#0a0a0a] flex items-center justify-center min-h-[280px] py-16">

            <div
                className="absolute inset-0 opacity-35"
                style={{
                    backgroundImage: `linear-gradient(#1c3a28 1px, transparent 1px), linear-gradient(90deg, #1c3a28 1px, transparent 1px)`,
                    backgroundSize: "40px 40px",
                }}
            />

            <div className="absolute w-[240px] h-[240px] rounded-full bg-white/[0.025] -top-[80px] -left-[60px]" />
            <div className="absolute w-[180px] h-[180px] rounded-full bg-white/[0.02] -bottom-[50px] -right-[40px]" />

            <div className="relative z-10 text-center px-6 max-w-[640px] w-full">
                <h1 className="text-[36px] lg:text-[44px] font-bold text-white tracking-[-1.5px] leading-[1.15] mb-3">
                    Jelajahi Note<br />
                    <span className="text-emerald-400/70">dari Komunitas.</span>
                </h1>

                <p className="text-[14px] text-emerald-100/50 font-light leading-relaxed max-w-[420px] mx-auto">
                    Temukan ribuan potongan kode berkualitas dari developer Indonesia dan dunia. Gratis, selamanya.
                </p>
            </div>
        </section>
    )
}
