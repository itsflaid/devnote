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
    return <RegisterPageClient />
}