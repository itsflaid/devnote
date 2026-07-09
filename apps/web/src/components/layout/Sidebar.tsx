import { auth } from "@/lib/auth"
import { getSidebarData } from "@/server/services/sidebarData"
import type { SidebarData } from "@/server/services/sidebarData"
import SidebarClient from "./sidebar/SidebarClient"

interface SidebarProps {
    data?: SidebarData
}

export default async function Sidebar({ data }: SidebarProps) {
    if (data) {
        return (
            <SidebarClient
                totalSnippets={data.totalSnippets}
                totalCopies={data.totalCopies}
                totalFavorites={data.totalFavorites}
                totalPublic={data.totalPublic}
                workspaceSnippetsCount={data.workspaceSnippetsCount}
                workspaces={data.workspaces}
                tags={data.tags}
            />
        )
    }

    const session = await auth()
    const userId = Number(session?.user?.id)
    const fetched = await getSidebarData(userId)

    return (
        <SidebarClient
            totalSnippets={fetched.totalSnippets}
            totalCopies={fetched.totalCopies}
            totalFavorites={fetched.totalFavorites}
            totalPublic={fetched.totalPublic}
            workspaceSnippetsCount={fetched.workspaceSnippetsCount}
            workspaces={fetched.workspaces}
            tags={fetched.tags}
        />
    )
}