import { Suspense } from "react"
import { auth } from "@/lib/auth"
import { getSidebarData } from "@/server/services/sidebarData"
import Sidebar from "@/components/layout/Sidebar"
import DashboardLayout from "@/components/layout/DashboardLayout"
import MobileSidebar from "@/components/layout/MobileSidebar"

export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await auth()
    const sidebarData = session?.user?.id ? await getSidebarData(Number(session.user.id)) : undefined

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-[var(--bg)]">
            <DashboardLayout>
                <div className="flex flex-1 min-h-0 overflow-hidden">
                    <div className="hidden lg:block shrink-0">
                        <Suspense fallback={<div className="h-full w-[260px] border-r border-[var(--border)] bg-[#171a18]" />}>
                            <Sidebar data={sidebarData} />
                        </Suspense>
                    </div>

                    <main className="flex-1 min-w-0 overflow-y-auto bg-[var(--bg)]">
                        {children}
                    </main>
                </div>

                <Suspense fallback={null}>
                    <MobileSidebar initialSidebarData={sidebarData} />
                </Suspense>
            </DashboardLayout>
        </div>
    )
}
