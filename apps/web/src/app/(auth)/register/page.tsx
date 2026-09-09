import type { Metadata } from "next"
import RegisterPageClient from "./RegisterPageClient"

export const metadata: Metadata = {
    title: "Daftar — Buat Akun Code Snippet Manager Gratis",
    description:
        "Buat akun DevNote gratis. Simpan, organisir, dan share kode online dalam code note manager yang rapi untuk developer Indonesia.",
    alternates: {
        canonical: "/register",
    },
}

export default function RegisterPage() {
    return (
        <>
            <div className="sr-only">
                <h1>Daftar DevNote — Buat Akun Code Snippet Manager Gratis</h1>
                <p>Buat akun DevNote gratis dan mulai menyimpan kode favoritmu. DevNote adalah code note manager untuk developer Indonesia yang membantu kamu mengorganisir, mencari, dan membagikan code snippet dengan cepat dan mudah.</p>
                <p>Dengan DevNote, kamu bisa: menyimpan kode online secara gratis, mengorganisir snippet dengan tag, membagikan kode ke teman, menemukan kode publik dari developer lain, dan mengakses kode dari mana saja.</p>
            </div>
            <RegisterPageClient />
        </>
    )
}