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
    return (
        <>
            <div className="sr-only">
                <h1>DevNote Login — Masuk ke Code Snippet Manager</h1>
                <p>Masuk ke akun DevNote untuk menyimpan, mengelola, dan berbagi code snippet pribadimu. DevNote adalah code note manager gratis untuk developer Indonesia yang memungkinkan kamu menyimpan kode online, mengorganisir dengan tag, dan membagikannya dengan mudah.</p>
                <p>Fitur DevNote: simpan kode online, organize dengan tag, share kode ke teman, explore kode publik dari developer lain, dan akses kode kapan saja dari mana saja.</p>
            </div>
            <LoginPageClient />
        </>
    )
}