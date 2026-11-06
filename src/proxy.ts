import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

// Next.js 16 "proxy" (formerly middleware): redirects `/` to a locale and keeps the locale cookie.
export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals, metadata files and anything with a file extension.
  matcher: ["/((?!api|_next|_vercel|sitemap.xml|robots.txt|.*\..*).*)"],
};
