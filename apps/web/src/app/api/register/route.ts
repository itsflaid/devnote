import { z } from "zod"
import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/apiError"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const input = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(1),
    }).parse(body)

    const existingUser = await prisma.user.findUnique({ where: { email: input.email } })
    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(input.password, 10)
    const user = await prisma.user.create({
      data: { name: input.name, email: input.email, password: hashedPassword },
    })

    return NextResponse.json({ message: "Registrasi berhasil", user: { id: user.id, name: user.name, email: user.email } })
  } catch (err) {
    return handleApiError(err)
  }
}
