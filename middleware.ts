export { auth as middleware } from "@/auth"

export const config = {
    matcher: ["/dashboard/:path*", "/setup/:path*", "/quiz/:path*", "/results/:path*"],
}
