import { Metadata } from "next"
import { Suspense } from "react"
import ExploreClient from "./ExploreClient"

export const metadata: Metadata = {
    title: "Explore — DevNote",
    description: "Temukan dan bagikan note kode publik dari developer di seluruh dunia.",
}

export default function ExplorePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-[var(--em)] border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            {/* <div className="fixed inset-0 opacity-40 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            /> */}

            <ExploreClient />
        </Suspense>
    )
}
