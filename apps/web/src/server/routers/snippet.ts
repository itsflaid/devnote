import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { router, protectedProcedure, publicProcedure, optionalAuthProcedure } from "../trpc"

const snippetInput = z.object({
  title: z.string().min(1),
  language: z.string().min(1),
  description: z.string().min(1),
  code: z.string().min(1),
  tags: z.array(z.string()).optional(),
  workspaceId: z.number().nullable().optional(),
})

export const snippetRouter = router({
  // GET /api/snippets
  list: protectedProcedure
    .input(z.object({
      lang: z.string().optional(),
      tag: z.string().optional(),
      filter: z.enum(["favorites", "public"]).optional(),
      collection: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.snippet.findMany({
        where: {
          userId: ctx.userId,
          ...(input.lang && { language: input.lang }),
          ...(input.filter === "favorites" && { isFavorite: true }),
          ...(input.filter === "public" && { isPublic: true }),
          ...(input.tag && { tags: { some: { tag: { name: input.tag } } } }),
          ...(input.collection && { collections: { some: { collectionId: input.collection } } }),
        },
        include: { tags: { include: { tag: true } } },
        orderBy: { createdAt: "desc" },
      })
    }),

  // GET /api/snippets/[id]
  byId: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const snippet = await ctx.prisma.snippet.findFirst({
        where: { id: input.id, userId: ctx.userId },
        include: { tags: { include: { tag: true } } },
      })
      if (!snippet) throw new TRPCError({ code: "NOT_FOUND" })
      return snippet
    }),

  // POST /api/snippets
  create: protectedProcedure
    .input(snippetInput)
    .mutation(async ({ ctx, input }) => {
      if (input.workspaceId) {
        const { requireWorkspaceRole } = await import("@/lib/workspace")
        const member = await requireWorkspaceRole(input.workspaceId, ctx.userId, ["OWNER", "EDITOR"])
        if (!member) throw new TRPCError({ code: "FORBIDDEN" })
      }

      const snippet = await ctx.prisma.snippet.create({
        data: {
          title: input.title,
          language: input.language,
          description: input.description.trim(),
          code: input.code,
          userId: ctx.userId,
          tags: {
            create: (input.tags ?? []).map((tagName) => ({
              tag: { connectOrCreate: { where: { name: tagName }, create: { name: tagName } } },
            })),
          },
        },
      })

      if (input.workspaceId) {
        await ctx.prisma.workspaceSnippet.create({
          data: { workspaceId: input.workspaceId, snippetId: snippet.id, addedById: ctx.userId },
        })
      }

      return snippet
    }),

  // PUT /api/snippets/[id]
  update: protectedProcedure
    .input(snippetInput.extend({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { canEditSnippetInAnyWorkspace } = await import("@/lib/workspace")
      const existing = await ctx.prisma.snippet.findUnique({
        where: { id: input.id },
        select: { userId: true },
      })
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" })

      const canEdit =
        existing.userId === ctx.userId ||
        (await canEditSnippetInAnyWorkspace(input.id, ctx.userId))
      if (!canEdit) throw new TRPCError({ code: "FORBIDDEN" })

      await ctx.prisma.snippetTag.deleteMany({ where: { snippetId: input.id } })

      return ctx.prisma.snippet.update({
        where: { id: input.id },
        data: {
          title: input.title,
          language: input.language,
          description: input.description.trim(),
          code: input.code,
          tags: {
            create: (input.tags ?? []).map((tagName) => ({
              tag: { connectOrCreate: { where: { name: tagName }, create: { name: tagName } } },
            })),
          },
        },
      })
    }),

  // DELETE /api/snippets/[id]
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const snippet = await ctx.prisma.snippet.findFirst({
        where: { id: input.id, userId: ctx.userId },
        select: { id: true },
      })
      if (!snippet) throw new TRPCError({ code: "NOT_FOUND" })
      await ctx.prisma.snippet.delete({ where: { id: input.id } })
      return { success: true }
    }),

  // POST /api/snippets/[id]/share (toggle)
  toggleShare: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const snippet = await ctx.prisma.snippet.findUnique({
        where: { id: input.id },
        select: { id: true, userId: true, shareId: true },
      })
      if (!snippet) throw new TRPCError({ code: "NOT_FOUND" })
      if (snippet.userId !== ctx.userId) throw new TRPCError({ code: "FORBIDDEN" })

      const newShareId = snippet.shareId
        ? null
        : (() => {
            const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ"
            let result = ""
            for (let i = 0; i < 9; i++) result += chars[Math.floor(Math.random() * chars.length)]
            return result
          })()

      const updated = await ctx.prisma.snippet.update({
        where: { id: input.id },
        data: { shareId: newShareId },
        select: { shareId: true },
      })
      return updated
    }),

  // GET /api/snippets/[id]/share/[shareId] — PUBLIC
  byShareId: publicProcedure
    .input(z.object({ shareId: z.string() }))
    .query(async ({ ctx, input }) => {
      const snippet = await ctx.prisma.snippet.findUnique({
        where: { shareId: input.shareId },
        select: {
          id: true, title: true, description: true, code: true, language: true,
          isPublic: true, copyCount: true, createdAt: true,
          user: { select: { name: true, avatar: true } },
          tags: { select: { tag: { select: { name: true } } } },
        },
      })
      if (!snippet) throw new TRPCError({ code: "NOT_FOUND" })
      return { ...snippet, tags: snippet.tags.map((t) => t.tag.name) }
    }),

  // POST /api/snippets/[id]/publish (toggle isPublic)
  togglePublish: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const snippet = await ctx.prisma.snippet.findFirst({
        where: { id: input.id, userId: ctx.userId },
      })
      if (!snippet) throw new TRPCError({ code: "NOT_FOUND" })
      return ctx.prisma.snippet.update({
        where: { id: input.id },
        data: { isPublic: !snippet.isPublic },
        select: { isPublic: true },
      })
    }),

  // POST /api/snippets/[id]/like (toggle)
  toggleLike: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.like.findUnique({
        where: { userId_snippetId: { userId: ctx.userId, snippetId: input.id } },
      })
      if (existing) {
        await ctx.prisma.like.delete({
          where: { userId_snippetId: { userId: ctx.userId, snippetId: input.id } },
        })
        const count = await ctx.prisma.like.count({ where: { snippetId: input.id } })
        return { liked: false, count }
      }
      await ctx.prisma.like.create({ data: { userId: ctx.userId, snippetId: input.id } })
      const count = await ctx.prisma.like.count({ where: { snippetId: input.id } })
      return { liked: true, count }
    }),

  // POST /api/snippets/[id]/favorite (toggle)
  toggleFavorite: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const snippet = await ctx.prisma.snippet.findFirst({
        where: { id: input.id, userId: ctx.userId },
      })
      if (!snippet) throw new TRPCError({ code: "NOT_FOUND" })
      return ctx.prisma.snippet.update({
        where: { id: input.id },
        data: { isFavorite: !snippet.isFavorite },
        select: { isFavorite: true },
      })
    }),

  // POST /api/snippets/[id]/copy
  incrementCopy: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const snippet = await ctx.prisma.snippet.findFirst({
        where: { id: input.id, userId: ctx.userId },
      })
      if (!snippet) throw new TRPCError({ code: "NOT_FOUND" })
      await ctx.prisma.snippet.update({
        where: { id: input.id },
        data: { copyCount: { increment: 1 } },
      })
      return { ok: true }
    }),

  // GET /api/snippets/[id]/collections
  getCollections: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const assigned = await ctx.prisma.snippetCollection.findMany({
        where: { snippetId: input.id },
        include: { collection: { select: { id: true, name: true } } },
      })
      return assigned.map((a) => a.collection)
    }),

  // GET /api/snippets/publish — PUBLIC, feed snippet publik
  publicFeed: publicProcedure
    .input(z.object({
      language: z.string().optional(),
      tag: z.string().optional(),
      sort: z.enum(["popular", "mostcopied", "newest"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.snippet.findMany({
        where: {
          isPublic: true,
          ...(input.language && { language: input.language }),
          ...(input.tag && { tags: { some: { tag: { name: input.tag } } } }),
        },
        orderBy:
          input.sort === "popular" ? { likes: { _count: "desc" } } :
          input.sort === "mostcopied" ? { copyCount: "desc" } :
          { createdAt: "desc" },
        include: {
          tags: { include: { tag: true } },
          user: { select: { name: true, avatar: true } },
          likes: true,
          _count: { select: { likes: true } },
        },
        take: 20,
      })
    }),

  // GET /api/explore — PUBLIC, tapi likedByMe beda kalau ada session
  explore: optionalAuthProcedure
    .input(z.object({
      sort: z.enum(["newest", "oldest", "popular", "most-copied"]).default("newest"),
      lang: z.string().optional(),
      search: z.string().optional(),
      page: z.number().min(1).default(1),
    }))
    .query(async ({ ctx, input }) => {
      const limit = 5
      const where = {
        isPublic: true,
        ...(input.lang && { language: input.lang }),
        ...(input.search && {
          OR: [
            { title: { contains: input.search, mode: "insensitive" as const } },
            { description: { contains: input.search, mode: "insensitive" as const } },
            { tags: { some: { tag: { name: { contains: input.search, mode: "insensitive" as const } } } } },
          ],
        }),
      }
      const orderBy =
        input.sort === "oldest" ? { createdAt: "asc" as const } :
        input.sort === "popular" ? { likes: { _count: "desc" as const } } :
        input.sort === "most-copied" ? { copyCount: "desc" as const } :
        { createdAt: "desc" as const }

      const [snippets, total] = await Promise.all([
        ctx.prisma.snippet.findMany({
          where, orderBy,
          skip: (input.page - 1) * limit,
          take: limit,
          include: {
            tags: { include: { tag: true } },
            user: { select: { id: true, name: true, avatar: true } },
            likes: ctx.userId ? { where: { userId: ctx.userId }, select: { userId: true } } : false,
            _count: { select: { likes: true } },
          },
        }),
        ctx.prisma.snippet.count({ where }),
      ])

      return {
        snippets: snippets.map((s) => ({
          id: s.id, title: s.title, description: s.description, code: s.code,
          language: s.language, copyCount: s.copyCount, createdAt: s.createdAt,
          tags: s.tags.map((t) => t.tag.name), user: s.user,
          likeCount: s._count.likes,
          likedByMe: ctx.userId ? (s.likes as { userId: number }[]).length > 0 : false,
        })),
        total, page: input.page, totalPages: Math.ceil(total / limit),
      }
    }),
})
