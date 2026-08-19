import type { Metadata } from "next"
import LoginPageClient from "./LoginPageClient"

export const metadata: Metadata = {
    title: "Login — Masuk ke Code Snippet Manager DevNote",
    description:
        "Masuk ke akun DevNote untuk menyimpan, mengelola, dan berbagi code snippet pribadimu. Tempat simpan kode online untuk developer.",
    alternates: {
        canonical: "/login",
    },
}

export default function LoginPage() {
    return <LoginPageClient />
}