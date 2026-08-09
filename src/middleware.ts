export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    /*
     * Protect dashboard and company pages; leave login + NextAuth API open.
     * API company routes also check session server-side.
     */
    "/",
    "/companies/:path*",
    "/api/companies/:path*",
  ],
};
