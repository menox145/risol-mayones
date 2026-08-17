export type SessionUser = {
  email: string;
  role: string;
};

export const SESSION_COOKIE_NAME = "risol_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export function isValidSessionUser(value: unknown): value is SessionUser {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.email === "string" && typeof candidate.role === "string";
}
