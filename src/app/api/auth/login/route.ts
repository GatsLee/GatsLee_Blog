import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signToken, getTokenCookieOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    console.log("[LOGIN] Request received");
    const body = await request.json();
    const { username, password } = body;
    console.log("[LOGIN] Username:", username);

    if (!username || !password) {
      console.log("[LOGIN] Missing credentials");
      return NextResponse.json(
        { error: "Username and password required" },
        { status: 400 }
      );
    }

    const user = await prisma.adminUser.findUnique({
      where: { username },
    });
    console.log("[LOGIN] User found:", !!user);

    if (!user) {
      console.log("[LOGIN] User not found");
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    console.log("[LOGIN] Password valid:", valid);

    if (!valid) {
      console.log("[LOGIN] Invalid password");
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await signToken({ sub: user.id, role: "admin" });
    const cookieOptions = getTokenCookieOptions(token);

    const response = NextResponse.json({ success: true });
    response.cookies.set(cookieOptions);

    console.log("[LOGIN] Success! Cookie set");
    return response;
  } catch (error) {
    console.error("[LOGIN] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
