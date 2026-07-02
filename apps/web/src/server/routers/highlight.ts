import { z } from "zod"
import { codeToHtml } from "shiki"
import { router, publicProcedure } from "../trpc"

export const highlightRouter = router({
  run: publicProcedure
    .input(z.object({ code: z.string(), language: z.string() }))
    .mutation(async ({ input }) => {
      const html = await codeToHtml(input.code, { lang: input.language, theme: "one-dark-pro" })
      return { html }
    }),
})
