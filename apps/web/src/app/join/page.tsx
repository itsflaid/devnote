import type { Metadata } from "next"
import JoinPageClient from "./JoinPageClient"

export const metadata: Metadata = {
    title: "Buka Note Kode — Masukkan Kode Share DevNote",
    description:
        "Masukkan kode 9 digit untuk membuka note kode yang dibagikan temanmu di DevNote. Bagikan kode online dengan mudah.",
    alternates: {
        canonical: "/join",
    },
}

export default function JoinPage() {
    return <JoinPageClient />
}