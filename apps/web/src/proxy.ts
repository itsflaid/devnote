import { auth } from "@/lib/auth"

const PROTECTED = ["/dashboard", "/preferences", "/profile", "/workspaces"]
const AUTH_PAGES = ["/login", "/register"]

const matches = (pathname: string, base: string) =>
    pathname === base || pathname.startsWith(base + "/")

export default auth((req) => {
    const { pathname } = req.nextUrl
    const isLoggedIn = !!req.auth

    if (!isLoggedIn && PROTECTED.some((p) => matches(pathname, p))) {
        return Response.redirect(new URL("/login", req.url))
    }

    if (isLoggedIn && AUTH_PAGES.some((p) => matches(pathname, p))) {
        return Response.redirect(new URL("/dashboard", req.url))
    }
})

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/preferences/:path*",
        "/profile/:path*",
        "/workspaces/:path*",
        "/login",
        "/register",
    ],
}
