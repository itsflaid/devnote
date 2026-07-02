import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { router, protectedProcedure } from "../trpc"

export const collectionRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.collection.findMany({
      where: { userId: ctx.userId },
      include: { _count: { select: { snippets: true } } },
      orderBy: { createdAt: "desc" },
    })
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.collection.create({
        data: { name: input.name.trim(), userId: ctx.userId },
      })
    }),

  rename: protectedProcedure
    .input(z.object({ id: z.number(), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.collection.update({
        where: { id: input.id, userId: ctx.userId },
        data: { name: input.name.trim() },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.collection.delete({ where: { id: input.id, userId: ctx.userId } })
      return { success: true }
    }),

  getSnippets: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const collection = await ctx.prisma.collection.findFirst({
        where: { id: input.id, userId: ctx.userId },
        include: {
          snippets: { include: { snippet: { include: { tags: { include: { tag: true } } } } } },
        },
      })
      if (!collection) throw new TRPCError({ code: "NOT_FOUND" })
      return collection
    }),

  addSnippet: protectedProcedure
    .input(z.object({ id: z.number(), snippetId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.snippetCollection.create({
        data: { collectionId: input.id, snippetId: input.snippetId },
      })
      return { ok: true }
    }),

  removeSnippet: protectedProcedure
    .input(z.object({ id: z.number(), snippetId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.snippetCollection.delete({
        where: { snippetId_collectionId: { snippetId: input.snippetId, collectionId: input.id } },
      })
      return { ok: true }
    }),
})
