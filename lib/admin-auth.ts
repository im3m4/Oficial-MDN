import { env } from "cloudflare:workers";
import { cookies } from "next/headers";

type RuntimeEnv = {
  MEDYNA_ADMIN_EMAIL?: string;
  MEDYNA_ADMIN_PASSWORD?: string;
  MEDYNA_ADMIN_EMAIL_SECONDARY?: string;
  MEDYNA_ADMIN_PASSWORD_SECONDARY?: string;
  MEDYNA_SESSION_SECRET?: string;
};
export type AdminUser = { userId: string; email: string; displayName: string };

const SESSION_COOKIE = "__Host-medyna_admin_session";
const encoder = new TextEncoder();

function runtimeValue(key: keyof RuntimeEnv): string {
  return (env as unknown as RuntimeEnv)[key] ?? process.env[key] ?? "";
}

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sign(value: string): Promise<string> {
  const secret = runtimeValue("MEDYNA_SESSION_SECRET");
  if (!secret) return "";
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return encodeBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value))));
}

async function equalSecret(left: string, right: string): Promise<boolean> {
  const [a, b] = await Promise.all([crypto.subtle.digest("SHA-256", encoder.encode(left)), crypto.subtle.digest("SHA-256", encoder.encode(right))]);
  const aa = new Uint8Array(a); const bb = new Uint8Array(b);
  let difference = aa.length ^ bb.length;
  for (let index = 0; index < Math.min(aa.length, bb.length); index += 1) difference |= aa[index] ^ bb[index];
  return difference === 0;
}

export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  if (!runtimeValue("MEDYNA_SESSION_SECRET")) return false;
  const normalizedEmail = email.trim().toLowerCase();
  const credentials = [
    { email: runtimeValue("MEDYNA_ADMIN_EMAIL").trim().toLowerCase(), password: runtimeValue("MEDYNA_ADMIN_PASSWORD") },
    { email: runtimeValue("MEDYNA_ADMIN_EMAIL_SECONDARY").trim().toLowerCase(), password: runtimeValue("MEDYNA_ADMIN_PASSWORD_SECONDARY") },
  ];
  const matches = await Promise.all(credentials.map(async (entry) => {
    const [emailMatches, passwordMatches] = await Promise.all([
      equalSecret(normalizedEmail, entry.email),
      equalSecret(password, entry.password),
    ]);
    return Boolean(entry.email && entry.password && emailMatches && passwordMatches);
  }));
  return matches.some(Boolean);
}

export async function createAdminSession(email: string): Promise<string> {
  const payload = encodeBase64Url(encoder.encode(JSON.stringify({ sub: "medyna-admin", email: email.trim().toLowerCase(), exp: Date.now() + 1000 * 60 * 60 * 12 })));
  return `${payload}.${await sign(payload)}`;
}

async function readSession(token: string | undefined): Promise<AdminUser | null> {
  if (!token || token.length > 2048 || !runtimeValue("MEDYNA_SESSION_SECRET")) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra || !(await equalSecret(signature, await sign(payload)))) return null;
  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const parsed = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(normalized), (character) => character.charCodeAt(0)))) as { sub?: string; email?: string; exp?: number };
    if (parsed.sub !== "medyna-admin" || typeof parsed.email !== "string" || !parsed.email || typeof parsed.exp !== "number" || !Number.isFinite(parsed.exp) || parsed.exp <= Date.now() || parsed.exp > Date.now() + 1000 * 60 * 60 * 12) return null;
    const allowedEmails = [
      { email: runtimeValue("MEDYNA_ADMIN_EMAIL"), password: runtimeValue("MEDYNA_ADMIN_PASSWORD") },
      { email: runtimeValue("MEDYNA_ADMIN_EMAIL_SECONDARY"), password: runtimeValue("MEDYNA_ADMIN_PASSWORD_SECONDARY") },
    ].filter((entry) => entry.email && entry.password).map((entry) => entry.email.trim().toLowerCase());
    if (!(await Promise.all(allowedEmails.map((email) => equalSecret(parsed.email!, email)))).some(Boolean)) return null;
    return { userId: "medyna-admin", email: parsed.email, displayName: "Administración MEDYNA" };
  } catch { return null; }
}

export async function getAdminUser(): Promise<AdminUser | null> { const store = await cookies(); return readSession(store.get(SESSION_COOKIE)?.value); }
export async function setAdminSession(email: string): Promise<void> { const store = await cookies(); store.set(SESSION_COOKIE, await createAdminSession(email), { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 60 * 60 * 12 }); }
export async function clearAdminSession(): Promise<void> { const store = await cookies(); store.set(SESSION_COOKIE, "", { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 0 }); }

export async function requireApiAdmin(): Promise<{ user: AdminUser } | { response: Response }> {
  const user = await getAdminUser();
  return user ? { user } : { response: Response.json({ error: "Autenticación requerida." }, { status: 401 }) };
}
