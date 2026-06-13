import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requireWorkspaceRole } from "@/lib/workspace"

// ── GET — ambil semua snippet milik user yang login
export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const lang = searchParams.get("lang")
    const tag = searchParams.get("tag")
    const filter = searchParams.get("filter")
    const collection = searchParams.get("collection")

    const snippets = await prisma.snippet.findMany({
        where: {
            userId: Number(session.user.id),
            ...(lang && { language: lang }),
            ...(filter === "favorites" && { isFavorite: true }),
            ...(filter === "public" && { isPublic: true }),
            ...(tag && { tags: { some: { tag: { name: tag } } } }),
            ...(collection && { collections: { some: { collectionId: Number(collection) } } }),
        },
        include: {
            tags: { include: { tag: true } }
        },
        orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ snippets })
}

// ── POST — buat snippet baru
export async function POST(req: NextRequest) {

    // cek session
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // ambil data dari request body
    const { title, language, description, code, tags, workspaceId } = await req.json()

    // validasi — return 400 kalau title, language, atau code kosong
    if (!title?.trim() || !language || !description?.trim() || !code?.trim()) {
        return NextResponse.json(
            { message: "Judul, deskripsi, bahasa, dan kode wajib diisi" },
            { status: 400 }
        )
    }

    // simpan snippet baru ke database
    // hint: prisma.snippet.create, userId dari session.user.id
    const targetWorkspaceId = workspaceId ? Number(workspaceId) : null

    if (targetWorkspaceId) {
        const member = await requireWorkspaceRole(
            targetWorkspaceId,
            Number(session.user.id),
            ["OWNER", "EDITOR"]
        )

        if (!member) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 })
        }
    }

    const snippet = await prisma.snippet.create({
        data: {
            title,
            language,
            description: description.trim(),
            code,
            userId: Number(session.user.id),
            tags:{
                create: tags.map((tagName: string) => ({
                    tag: {
                        connectOrCreate: {
                            where: { name: tagName },
                            create: { name: tagName }
                        }
                    }
                }))
            }
        }
    })

    if (targetWorkspaceId) {
        await prisma.workspaceSnippet.create({
            data: {
                workspaceId: targetWorkspaceId,
                snippetId: snippet.id,
                addedById: Number(session.user.id),
            },
        })
    }

    return NextResponse.json({ snippet }, { status: 201 })
}
