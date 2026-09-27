import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db/database";
import { signToken, getSessionCookieOptions } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName } = await req.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Email, password, and full name are required." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
    }

    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await db.createUser({
      email,
      password_hash,
      full_name: fullName,
      role: 'user'
    });

    const token = signToken(user);
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      }
    });

    response.cookies.set(getSessionCookieOptions().name, token, getSessionCookieOptions());
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create account" }, { status: 500 });
  }
}
