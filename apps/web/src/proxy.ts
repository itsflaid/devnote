import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
    const token = request.cookies.get("authjs.session-token") ||
        request.cookies.get("__Secure-authjs.session-token")

    const isProtected = ["/dashboard", "/snippets", "/collections", "/settings"]
        .some(path => request.nextUrl.pathname.startsWith(path))

    if (isProtected && !token) {
        return NextResponse.redirect(new URL("/login", request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/snippets/:path*",
        "/collections/:path*",
        "/settings/:path*",
    ]
}