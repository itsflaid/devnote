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
    return (
        <>
            <div className="sr-only">
                <h1>Buka Note Kode — Masukkan Kode Share DevNote</h1>
                <p>Masukkan kode 9 digit untuk membuka note kode yang dibagikan temanmu di DevNote. DevNote adalah platform code snippet manager gratis untuk developer Indonesia yang memungkinkan berbagi kode dengan mudah.</p>
                <p>Cara menggunakan: minta kode share 9 digit dari temanmu, masukkan kode di form ini, dan langsung lihat note kode yang dibagikan. Kamu bisa menyalin kode, menyimpannya, atau membagikannya kembali.</p>
            </div>
            <JoinPageClient />
        </>
    )
}