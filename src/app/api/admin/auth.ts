import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "bw_admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function verifyAdmin(): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;

  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  return session?.value === password;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function setAdminCookie(password: string) {
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return response;
}
