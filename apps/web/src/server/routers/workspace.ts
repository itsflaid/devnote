import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { router, protectedProcedure } from "../trpc"
import { requireWorkspaceRole } from "@/lib/workspace"
import { generateWorkspaceInviteCode } from "@/lib/workspaceInviteCode"
import { normalizeWorkspaceInviteCode } from "@/lib/workspaceInviteCode"

async function uniqueInviteCode(prisma: typeof import("@/lib/prisma").prisma) {
  let code = generateWorkspaceInviteCode()
  while (await prisma.workspace.findUnique({ where: { inviteCode: code } })) {
    code = generateWorkspaceInviteCode()
  }
  return code
}

export const workspaceRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const memberships = await ctx.prisma.workspaceMember.findMany({
      where: { userId: ctx.userId },
      include: { workspace: { include: { _count: { select: { snippets: true, members: true } } } } },
      orderBy: { createdAt: "desc" },
    })
    return memberships.map((m) => ({
      id: m.workspace.id, name: m.workspace.name, description: m.workspace.description,
      inviteCode: m.workspace.inviteCode, ownerId: m.workspace.ownerId, role: m.role,
      createdAt: m.workspace.createdAt, _count: m.workspace._count,
    }))
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1), description: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const inviteCode = await uniqueInviteCode(ctx.prisma)
      const workspace = await ctx.prisma.workspace.create({
        data: {
          name: input.name.trim(),
          description: input.description?.trim() || null,
          inviteCode,
          ownerId: ctx.userId,
          members: { create: { userId: ctx.userId, role: "OWNER" } },
        },
        include: {
          _count: { select: { snippets: true, members: true } },
          members: { where: { userId: ctx.userId }, select: { role: true } },
        },
      })
      return { ...workspace, role: workspace.members[0]?.role ?? "OWNER" }
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const member = await requireWorkspaceRole(input.id, ctx.userId, ["OWNER", "EDITOR", "VIEWER"])
      if (!member) throw new TRPCError({ code: "FORBIDDEN" })

      const workspace = await ctx.prisma.workspace.findUnique({
        where: { id: input.id },
        include: {
          owner: { select: { id: true, name: true, email: true, avatar: true } },
          _count: { select: { snippets: true, members: true } },
        },
      })
      if (!workspace) throw new TRPCError({ code: "NOT_FOUND" })
      return { ...workspace, role: member.role }
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), name: z.string().min(1), description: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const member = await requireWorkspaceRole(input.id, ctx.userId, ["OWNER"])
      if (!member) throw new TRPCError({ code: "FORBIDDEN" })
      return ctx.prisma.workspace.update({
        where: { id: input.id },
        data: { name: input.name.trim(), description: input.description?.trim() || null },
        select: { id: true, name: true, description: true },
      })
    }),

  regenerateInvite: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const member = await requireWorkspaceRole(input.id, ctx.userId, ["OWNER"])
      if (!member) throw new TRPCError({ code: "FORBIDDEN" })
      const inviteCode = await uniqueInviteCode(ctx.prisma)
      const workspace = await ctx.prisma.workspace.update({
        where: { id: input.id }, data: { inviteCode }, select: { inviteCode: true },
      })
      return workspace
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const owner = await requireWorkspaceRole(input.id, ctx.userId, ["OWNER"])
      if (!owner) throw new TRPCError({ code: "FORBIDDEN" })
      await ctx.prisma.workspace.delete({ where: { id: input.id } })
      return { success: true }
    }),

  join: protectedProcedure
    .input(z.object({ inviteCode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const code = normalizeWorkspaceInviteCode(input.inviteCode)
      if (!code) throw new TRPCError({ code: "BAD_REQUEST", message: "Kode invite wajib diisi" })

      const workspace = await ctx.prisma.workspace.findUnique({ where: { inviteCode: code } })
      if (!workspace) throw new TRPCError({ code: "NOT_FOUND" })

      const member = await ctx.prisma.workspaceMember.upsert({
        where: { workspaceId_userId: { workspaceId: workspace.id, userId: ctx.userId } },
        update: {},
        create: { workspaceId: workspace.id, userId: ctx.userId, role: "VIEWER" },
      })
      return { workspace, role: member.role }
    }),

  members: router({
    list: protectedProcedure
      .input(z.object({ workspaceId: z.number() }))
      .query(async ({ ctx, input }) => {
        const owner = await requireWorkspaceRole(input.workspaceId, ctx.userId, ["OWNER"])
        if (!owner) throw new TRPCError({ code: "FORBIDDEN" })

        const members = await ctx.prisma.workspaceMember.findMany({
          where: { workspaceId: input.workspaceId },
          select: {
            id: true, role: true, createdAt: true,
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
          orderBy: { createdAt: "asc" },
        })
        return members.sort((a, b) => (a.role === "OWNER" ? -1 : b.role === "OWNER" ? 1 : 0))
      }),

    updateRole: protectedProcedure
      .input(z.object({ workspaceId: z.number(), memberId: z.number(), role: z.enum(["EDITOR", "VIEWER"]) }))
      .mutation(async ({ ctx, input }) => {
        const owner = await requireWorkspaceRole(input.workspaceId, ctx.userId, ["OWNER"])
        if (!owner) throw new TRPCError({ code: "FORBIDDEN" })

        const target = await ctx.prisma.workspaceMember.findFirst({
          where: { id: input.memberId, workspaceId: input.workspaceId },
          select: { id: true, role: true },
        })
        if (!target) throw new TRPCError({ code: "NOT_FOUND" })
        if (target.role === "OWNER") throw new TRPCError({ code: "BAD_REQUEST", message: "Role owner tidak dapat diubah" })

        return ctx.prisma.workspaceMember.update({
          where: { id: target.id },
          data: { role: input.role },
          select: {
            id: true, role: true, createdAt: true,
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        })
      }),

    transferOwnership: protectedProcedure
      .input(z.object({ workspaceId: z.number(), memberId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const owner = await requireWorkspaceRole(input.workspaceId, ctx.userId, ["OWNER"])
        if (!owner) throw new TRPCError({ code: "FORBIDDEN" })

        const target = await ctx.prisma.workspaceMember.findFirst({
          where: { id: input.memberId, workspaceId: input.workspaceId, role: { not: "OWNER" } },
          select: { id: true, userId: true },
        })
        if (!target) throw new TRPCError({ code: "NOT_FOUND" })

        await ctx.prisma.$transaction([
          ctx.prisma.workspace.update({ where: { id: input.workspaceId }, data: { ownerId: target.userId } }),
          ctx.prisma.workspaceMember.update({ where: { id: owner.id }, data: { role: "EDITOR" } }),
          ctx.prisma.workspaceMember.update({ where: { id: target.id }, data: { role: "OWNER" } }),
        ])
        return { success: true }
      }),

    remove: protectedProcedure
      .input(z.object({ workspaceId: z.number(), memberId: z.number().optional() }))
      .mutation(async ({ ctx, input }) => {
        const requester = await requireWorkspaceRole(input.workspaceId, ctx.userId, ["OWNER", "EDITOR", "VIEWER"])
        if (!requester) throw new TRPCError({ code: "FORBIDDEN" })

        if (requester.role === "OWNER") {
          if (!input.memberId) throw new TRPCError({ code: "BAD_REQUEST", message: "Member tidak valid" })
          const target = await ctx.prisma.workspaceMember.findFirst({
            where: { id: input.memberId, workspaceId: input.workspaceId, role: { not: "OWNER" } },
            select: { id: true },
          })
          if (!target) throw new TRPCError({ code: "NOT_FOUND" })
          await ctx.prisma.workspaceMember.delete({ where: { id: target.id } })
          return { success: true }
        }

        await ctx.prisma.workspaceMember.delete({ where: { id: requester.id } })
        return { success: true }
      }),
  }),

  snippets: router({
    list: protectedProcedure
      .input(z.object({ workspaceId: z.number() }))
      .query(async ({ ctx, input }) => {
        const member = await requireWorkspaceRole(input.workspaceId, ctx.userId, ["OWNER", "EDITOR", "VIEWER"])
        if (!member) throw new TRPCError({ code: "FORBIDDEN" })

        const relations = await ctx.prisma.workspaceSnippet.findMany({
          where: { workspaceId: input.workspaceId },
          include: {
            snippet: {
              include: {
                tags: { include: { tag: true } },
                user: { select: { id: true, name: true, email: true, avatar: true } },
              },
            },
            addedBy: { select: { id: true, name: true, email: true, avatar: true } },
          },
          orderBy: { createdAt: "desc" },
        })

        return {
          snippets: relations.map((r) => ({
            ...r.snippet,
            workspaceMeta: { workspaceId: r.workspaceId, addedBy: r.addedBy, addedAt: r.createdAt },
          })),
          role: member.role,
        }
      }),

    add: protectedProcedure
      .input(z.object({ workspaceId: z.number(), snippetId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const member = await requireWorkspaceRole(input.workspaceId, ctx.userId, ["OWNER", "EDITOR"])
        if (!member) throw new TRPCError({ code: "FORBIDDEN" })

        const snippet = await ctx.prisma.snippet.findFirst({
          where: { id: input.snippetId, userId: ctx.userId },
        })
        if (!snippet) throw new TRPCError({ code: "NOT_FOUND", message: "Note tidak ditemukan di library kamu" })

        return ctx.prisma.workspaceSnippet.upsert({
          where: { workspaceId_snippetId: { workspaceId: input.workspaceId, snippetId: snippet.id } },
          update: {},
          create: { workspaceId: input.workspaceId, snippetId: snippet.id, addedById: ctx.userId },
        })
      }),

    remove: protectedProcedure
      .input(z.object({ workspaceId: z.number(), snippetId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const member = await requireWorkspaceRole(input.workspaceId, ctx.userId, ["OWNER", "EDITOR"])
        if (!member) throw new TRPCError({ code: "FORBIDDEN" })

        await ctx.prisma.workspaceSnippet.delete({
          where: { workspaceId_snippetId: { workspaceId: input.workspaceId, snippetId: input.snippetId } },
        })
        return { message: "Note berhasil di-remove dari workspace" }
      }),
  }),
})
