import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-me"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Allow public endpoints without auth
  if (
    method === "POST" &&
    (pathname === "/api/comments" ||
      pathname === "/api/guestbook" ||
      pathname === "/api/posts/webhook" ||
      pathname === "/api/auth/login")
  ) {
    return NextResponse.next();
  }

  // Check if this is a protected page
  const isProtectedPage =
    pathname.startsWith("/write") || pathname.startsWith("/admin");

  // Check if this is a protected API mutation
  const isProtectedApi =
    (["POST", "PUT", "DELETE"].includes(method) &&
      (pathname.startsWith("/api/posts") ||
        pathname.startsWith("/api/comments") ||
        pathname.startsWith("/api/guestbook") ||
        pathname.startsWith("/api/progress"))) ||
    pathname.startsWith("/api/admin");

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth-token")?.value;

  if (!token) {
    if (isProtectedPage) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    if (isProtectedPage) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export const config = {
  matcher: [
    "/write/:path*",
    "/admin/:path*",
    "/api/posts/:path*",
    "/api/comments/:path*",
    "/api/guestbook/:path*",
    "/api/progress/:path*",
    "/api/admin/:path*",
  ],
};
