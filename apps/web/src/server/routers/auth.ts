import { z } from "zod"
import bcrypt from "bcrypt"
import { TRPCError } from "@trpc/server"
import { router, publicProcedure } from "../trpc"

export const authRouter = router({
  register: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.prisma.user.findUnique({ where: { email: input.email } })
      if (existingUser) throw new TRPCError({ code: "BAD_REQUEST", message: "Email sudah terdaftar" })

      const hashedPassword = await bcrypt.hash(input.password, 10)
      const user = await ctx.prisma.user.create({
        data: { name: input.name, email: input.email, password: hashedPassword },
      })

      return { message: "Registrasi berhasil", user: { id: user.id, name: user.name, email: user.email } }
    }),
})
