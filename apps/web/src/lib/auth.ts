import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const { auth, handlers, signIn, signOut } = NextAuth({
    trustHost: true,
    secret: process.env.AUTH_SECRET,

    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const email = String(credentials.email).trim().toLowerCase()
                const password = String(credentials.password)

                const user = await prisma.user.findFirst({
                    where: { email: { equals: email, mode: "insensitive" } },
                })
                if (!user) return null

                // reject OAuth user yang coba login via form
                if (!user.password) return null

                const isValid = await bcrypt.compare(password, user.password)
                if (!isValid) return null

                return { id: String(user.id), email: user.email, name: user.name }
            },
        }),
    ],

    session: { strategy: "jwt" },
    pages: { signIn: "/login", error: "/login" },

    callbacks: {
        async signIn({ account, profile }) {
            if (account?.provider === "google") {
                // wajib ada email & sudah diverifikasi Google
                return !!profile?.email && profile.email_verified === true
            }
            return true
        },

        async jwt({ token, user, account, profile }) {
            if (user?.id) {
                token.id = user.id
            }

            if (account?.provider === "google" && profile?.email) {
                const email = profile.email.toLowerCase()

                const dbUser = await prisma.user.upsert({
                    where: { email },
                    update: {},
                    create: {
                        name: profile.name ?? "User",
                        email,
                        password: null,
                        avatar: (profile as { picture?: string }).picture ?? null,
                    },
                })

                token.id = String(dbUser.id)
            }

            return token
        },

        session({ session, token }) {
            if (token.id) session.user.id = token.id as string
            return session
        },
    },
})
