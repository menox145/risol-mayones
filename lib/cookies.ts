import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME, SESSION_MAX_AGE, isValidSessionUser, type SessionUser } from "@/lib/session";

export function readSession(): SessionUser | null {
  try {
    const cookieStore = cookies();
    const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!raw) return null;

    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    return isValidSessionUser(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeSession(user: SessionUser) {
  const cookieStore = cookies();
  const payload = Buffer.from(JSON.stringify(user)).toString("base64url");

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: payload,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearSession() {
  const cookieStore = cookies();
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
