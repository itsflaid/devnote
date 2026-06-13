"use client"

import { useEffect, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  faBookmark,
  faGlobe,
  faLayerGroup,
  faStar,
  faUsers,
} from "@fortawesome/free-solid-svg-icons"

import { useAppStore } from "@/lib/store"
import { useSidebarStore } from "@/lib/sidebarStore"
import SidebarSection from "./SidebarSection"
import NavItem from "./NavItem"

interface LibrarySectionProps {
  totalSnippets: number
  totalFavorites: number
  totalPublic: number
  workspaceSnippetsCount: number
  onNavigate?: () => void
}

export default function LibrarySection({
  totalSnippets,
  totalFavorites,
  totalPublic,
  workspaceSnippetsCount,
  onNavigate,
}: LibrarySectionProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const {
    favCount,
    setFavCount,
    setFavoriteIds,
    publicCount,
    setPublicCount,
    setPublicIds,
    setIsNavigating,
  } = useAppStore()
  const { collapsed, toggle } = useSidebarStore()

  const activeLang = searchParams.get("lang")
  const activeTag = searchParams.get("tag")
  const activeFilter = searchParams.get("filter")
  const activeCollection = searchParams.get("collection")

  const isAll =
    pathname === "/dashboard" &&
    !activeLang &&
    !activeTag &&
    !activeFilter &&
    !activeCollection

  useEffect(() => {
    setFavCount(totalFavorites)
  }, [totalFavorites, setFavCount])

  useEffect(() => {
    setPublicCount(totalPublic)
  }, [totalPublic, setPublicCount])

  useEffect(() => {
    fetch("/api/snippets?filter=favorites")
      .then((r) => r.json())
      .then((d) => setFavoriteIds((d.snippets ?? []).map((s: { id: number }) => s.id)))
      .catch(console.error)
  }, [setFavoriteIds])

  useEffect(() => {
    fetch("/api/snippets?filter=public")
      .then((r) => r.json())
      .then((d) => setPublicIds((d.snippets ?? []).map((s: { id: number }) => s.id)))
      .catch(console.error)
  }, [setPublicIds])

  useEffect(() => {
    router.prefetch("/dashboard")
    router.prefetch("/dashboard?filter=favorites")
    router.prefetch("/dashboard?filter=public")
    router.prefetch("/dashboard?filter=workspace")
  }, [router])

  const setFilter = (type: "filter" | null, value?: string) => {
    setIsNavigating(true)

    startTransition(() => {
      if (type === null) {
        router.replace("/dashboard")
      } else {
        router.replace(`/dashboard?${type}=${value}`)
      }
    })

    onNavigate?.()
  }

  const prefetchRoute = (type: "filter" | null, value?: string) => {
    const url = type === null ? "/dashboard" : `/dashboard?${type}=${value}`
    router.prefetch(url)
  }

  return (
    <SidebarSection
      title="Library"
      open={!collapsed.library}
      onToggle={() => toggle("library")}
      withBorder={false}
    >
      <NavItem
        label="All Notes"
        count={totalSnippets}
        active={isAll}
        onClick={() => setFilter(null)}
        onPrefetch={() => prefetchRoute(null)}
        icon={faLayerGroup}
      />

      <NavItem
        label="Favorites"
        count={favCount}
        active={activeFilter === "favorites"}
        onClick={() => setFilter("filter", "favorites")}
        onPrefetch={() => prefetchRoute("filter", "favorites")}
        icon={faStar}
      />

      <NavItem label="Saved" count={0} active={false} icon={faBookmark} />

      <NavItem
        label="Public"
        count={publicCount}
        active={activeFilter === "public"}
        onClick={() => setFilter("filter", "public")}
        onPrefetch={() => prefetchRoute("filter", "public")}
        icon={faGlobe}
      />

      <NavItem
        label="Workspace Notes"
        count={workspaceSnippetsCount}
        active={activeFilter === "workspace"}
        onClick={() => setFilter("filter", "workspace")}
        onPrefetch={() => prefetchRoute("filter", "workspace")}
        icon={faUsers}
      />
    </SidebarSection>
  )
}
