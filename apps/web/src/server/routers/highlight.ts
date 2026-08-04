import { z } from "zod"
import { codeToHtml } from "shiki"
import { router, publicProcedure } from "../trpc"

const THEME_ENUM = z.enum(["one-dark-pro", "github-dark", "dracula", "nord", "catppuccin-mocha"])

export const highlightRouter = router({
  run: publicProcedure
    .input(z.object({
      code: z.string(),
      language: z.string(),
      theme: THEME_ENUM.optional().default("one-dark-pro"),
    }))
    .mutation(async ({ input }) => {
      const html = await codeToHtml(input.code, { lang: input.language, theme: input.theme })
      return { html }
    }),
})
