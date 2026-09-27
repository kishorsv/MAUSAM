import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db/database";
import { signToken, getSessionCookieOptions } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await db.getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = signToken(user);
    const profile = await db.getProfile(user.id);
    const preferences = await db.getPreferences(user.id);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      },
      profile,
      preferences
    });

    response.cookies.set(getSessionCookieOptions().name, token, getSessionCookieOptions());
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to sign in" }, { status: 500 });
  }
}
