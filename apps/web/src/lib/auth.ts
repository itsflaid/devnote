export const dynamic = "force-dynamic"

import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export const { auth, handlers, signIn, signOut } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const email = credentials.email as string
                const password = credentials.password as string

                const user = await prisma.user.findUnique({ where: { email } })
                if (!user) return null

                // reject OAuth user yang coba login via form
                if (!user.password) return null

                const isValid = await bcrypt.compare(password, user.password)
                if (!isValid) return null

                return { id: String(user.id), email: user.email, name: user.name }
            }
        })
    ],

    session: { strategy: "jwt" },
    pages: { signIn: "/login" },

    callbacks: {
        async jwt({ token, user, account, profile }) {
            if (user?.id) {
                token.id = user.id
            }

            if (account?.provider === "google" && profile?.email) {
                let dbUser = await prisma.user.findUnique({
                    where: { email: profile.email }
                })

                if (!dbUser) {
                    dbUser = await prisma.user.create({
                        data: {
                            name: profile.name ?? "User",
                            email: profile.email,
                            password: null,
                            avatar: (profile as { picture?: string }).picture ?? null,
                        }
                    })
                }

                token.id = String(dbUser.id)
            }

            return token
        },

        session({ session, token }) {
            if (token.id) session.user.id = token.id as string
            return session
        }
    }
})