import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canEditSnippetInAnyWorkspace } from "@/lib/workspace"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const { id } = await params

    const snippet = await prisma.snippet.findFirst({
        where: {
            id: Number(id),
            userId: Number(session.user.id)
        },
        include: { tags: { include: { tag: true } } }
    })

    if (!snippet) return NextResponse.json({ message: "Tidak ditemukan" }, { status: 404 })

    return NextResponse.json({ snippet })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const { title, language, description, code, tags } = await req.json()
    const snippetId = Number(id)
    const userId = Number(session.user.id)

    if (!title?.trim() || !language || !description?.trim() || !code?.trim()) {
        return NextResponse.json(
            { message: "Judul, deskripsi, bahasa, dan kode wajib diisi" },
            { status: 400 }
        )
    }

    const existingSnippet = await prisma.snippet.findUnique({
        where: { id: snippetId },
        select: { userId: true },
    })

    if (!existingSnippet) {
        return NextResponse.json({ message: "Tidak ditemukan" }, { status: 404 })
    }

    const canEdit =
        existingSnippet.userId === userId ||
        (await canEditSnippetInAnyWorkspace(snippetId, userId))

    if (!canEdit) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    await prisma.snippetTag.deleteMany({
        where: { snippetId }
    })

    const snippet = await prisma.snippet.update({
        where: { id: snippetId },
        data: {
            title,
            language,
            description: description.trim(),
            code,
            tags: {
                create: tags?.map((tagName: string) => ({
                    tag: {
                        connectOrCreate: {
                            where: { name: tagName },
                            create: { name: tagName }
                        }
                    }
                })) ?? []
            }
        }
    })

    return NextResponse.json({ snippet })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const snippetId = Number(id)
    const userId = Number(session.user.id)

    const snippet = await prisma.snippet.findFirst({
        where: {
            id: snippetId,
            userId,
        },
        select: { id: true },
    })

    if (!snippet) {
        return NextResponse.json({ message: "Tidak ditemukan" }, { status: 404 })
    }

    await prisma.snippet.delete({
        where: { id: snippetId }
    })

    return NextResponse.json({ message: "Note berhasil dihapus" })
}
