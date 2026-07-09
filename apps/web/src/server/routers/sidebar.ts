import { router, protectedProcedure } from "../trpc"
import { getSidebarData } from "../services/sidebarData"

export const sidebarRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return getSidebarData(ctx.userId)
  }),
})
