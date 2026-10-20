import { env } from "cloudflare:workers";

type SecurityEnv = { MEDYNA_SESSION_SECRET?: string; DB?: D1Database };

export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return origin !== null && origin === new URL(request.url).origin;
}

export class InvalidBody extends Error {
  constructor(public status: number) { super(status === 413 ? "Solicitud demasiado grande." : "Solicitud no válida."); }
}

export async function readJsonBounded(request: Request, maxBytes: number): Promise<Record<string, unknown>> {
  const size = Number(request.headers.get("content-length"));
  if (Number.isFinite(size) && size > maxBytes) throw new InvalidBody(413);
  if (!request.body) throw new InvalidBody(400);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) { await reader.cancel(); throw new InvalidBody(413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const value = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid JSON object");
    return value as Record<string, unknown>;
  } catch (error) {
    if (error instanceof InvalidBody) throw error;
    throw new InvalidBody(400);
  } finally { reader.releaseLock(); }
}

export async function requestKey(request: Request, purpose: string): Promise<string> {
  const runtime = env as unknown as SecurityEnv;
  const secret = runtime.MEDYNA_SESSION_SECRET;
  if (!secret) throw new Error("Security secret unavailable");
  // Only Cloudflare's visitor header is trusted. Never use client-supplied X-Forwarded-For.
  const address = request.headers.get("cf-connecting-ip") ?? "unknown";
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${purpose}:${address}`)));
  return Array.from(digest, byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function allowRequest(request: Request, purpose: string, limit: number, windowSeconds: number): Promise<boolean> {
  const runtime = env as unknown as SecurityEnv;
  if (!runtime.DB) throw new Error("Rate limit database unavailable");
  const key = await requestKey(request, purpose);
  const now = Math.floor(Date.now() / 1000);
  const result = await runtime.DB.prepare(`INSERT INTO abuse_counters (key, count, window_start)
    VALUES (?, 1, ?)
    ON CONFLICT(key) DO UPDATE SET
      count = CASE WHEN window_start <= ? THEN 1 ELSE count + 1 END,
      window_start = CASE WHEN window_start <= ? THEN ? ELSE window_start END
    RETURNING count`).bind(key, now, now - windowSeconds, now - windowSeconds, now).first<{ count: number }>();
  return !!result && result.count <= limit;
}
