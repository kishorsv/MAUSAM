import { NextResponse } from "next/server";
import { getSessionCookieOptions } from "@/lib/auth/session";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" });
  response.cookies.set(getSessionCookieOptions().name, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
