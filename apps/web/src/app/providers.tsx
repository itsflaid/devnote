"use client"

import { useState } from "react"
import { SessionProvider } from "next-auth/react"
import { QueryClientProvider } from "@tanstack/react-query"
import { httpBatchLink } from "@trpc/client"
import { queryClient } from "@/lib/queryClient"
import { trpc } from "@/lib/trpc"

export default function Providers({
    children,
}: {
    children: React.ReactNode
}) {
    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [httpBatchLink({ url: "/api/trpc" })],
        })
    )

    return (
        <SessionProvider>
            <trpc.Provider client={trpcClient} queryClient={queryClient}>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </trpc.Provider>
        </SessionProvider>
    )
}