import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return NextResponse.next();

  const cookie = request.cookies.get("admin_token")?.value;
  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  const isAdmin = cookie === secret || bearer === secret;

  if (isAdmin) {
    const headers = new Headers(request.headers);
    headers.set("x-is-admin", "1");
    return NextResponse.next({ request: { headers } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
