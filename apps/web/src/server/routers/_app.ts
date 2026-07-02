import { router } from "../trpc"
import { snippetRouter } from "./snippet"
import { collectionRouter } from "./collection"
import { workspaceRouter } from "./workspace"
import { sidebarRouter } from "./sidebar"
import { userStatsRouter } from "./userStats"
import { highlightRouter } from "./highlight"
import { authRouter } from "./auth"

export const appRouter = router({
  snippet: snippetRouter,
  collection: collectionRouter,
  workspace: workspaceRouter,
  sidebar: sidebarRouter,
  userStats: userStatsRouter,
  highlight: highlightRouter,
  auth: authRouter,
})

export type AppRouter = typeof appRouter
