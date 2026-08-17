import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, deriveToken } from "@/app/_auth/site-auth";

export function proxy(request: NextRequest) {
  const sitePassword = process.env.SITE_PASSWORD;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (sitePassword && token === deriveToken(sitePassword)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico).*)"],
};
