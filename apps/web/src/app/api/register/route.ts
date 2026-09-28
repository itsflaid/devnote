import { z } from "zod"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { handleApiError, jsonError } from "@/lib/apiError"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const input = z.object({
      name: z.string().trim().min(1, "Nama wajib diisi").max(100),
      email: z.string().trim().toLowerCase().email("Format email tidak valid"),
      // bcrypt hanya memproses 72 byte pertama
      password: z.string().min(8, "Password minimal 8 karakter").max(72, "Password maksimal 72 karakter"),
    }).parse(body)

    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: input.email, mode: "insensitive" } },
      select: { id: true },
    })
    if (existingUser) return jsonError(400, "Email sudah terdaftar")

    const hashedPassword = await bcrypt.hash(input.password, 10)
    const user = await prisma.user.create({
      data: { name: input.name, email: input.email, password: hashedPassword },
    })

    return NextResponse.json({ message: "Registrasi berhasil", user: { id: user.id, name: user.name, email: user.email } })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return jsonError(400, "Email sudah terdaftar")
    }
    return handleApiError(err)
  }
}
