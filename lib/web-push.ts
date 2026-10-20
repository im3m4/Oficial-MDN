import { isAllowedPushEndpoint } from "./push-security.mjs";
import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { pushSubscriptions } from "@/db/schema";

type PushEnv = { MEDYNA_VAPID_PUBLIC_KEY?: string; MEDYNA_VAPID_PRIVATE_KEY?: string; MEDYNA_VAPID_SUBJECT?: string };
const encoder = new TextEncoder();
function value(key: keyof PushEnv): string { return (env as unknown as PushEnv)[key] ?? process.env[key] ?? ""; }
function bytes(valueToDecode: string): Uint8Array { const normalized = valueToDecode.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(valueToDecode.length / 4) * 4, "="); return Uint8Array.from(atob(normalized), (character) => character.charCodeAt(0)); }
function b64(bytesToEncode: Uint8Array): string { let binary = ""; for (const byte of bytesToEncode) binary += String.fromCharCode(byte); return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, ""); }

export function vapidPublicKey(): string { return value("MEDYNA_VAPID_PUBLIC_KEY"); }

async function authorization(endpoint: string): Promise<string> {
  const publicKey = bytes(value("MEDYNA_VAPID_PUBLIC_KEY")); const privateKey = bytes(value("MEDYNA_VAPID_PRIVATE_KEY"));
  if (publicKey.length !== 65 || privateKey.length !== 32) throw new Error("VAPID unavailable");
  const key = await crypto.subtle.importKey("jwk", { kty: "EC", crv: "P-256", x: b64(publicKey.slice(1, 33)), y: b64(publicKey.slice(33, 65)), d: b64(privateKey), ext: true }, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const header = b64(encoder.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const payload = b64(encoder.encode(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12, sub: value("MEDYNA_VAPID_SUBJECT") || "mailto:md@medyna.org" })));
  const signature = new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, encoder.encode(`${header}.${payload}`)));
  return `vapid t=${header}.${payload}.${b64(signature)}, k=${value("MEDYNA_VAPID_PUBLIC_KEY")}`;
}

export async function notifyBulletinSubscribers(): Promise<void> {
  if (!vapidPublicKey() || !value("MEDYNA_VAPID_PRIVATE_KEY")) return;
  const db = getDb(); const subscriptions = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.enabled, true));
  await Promise.allSettled(subscriptions.map(async (subscription) => {
    if (!isAllowedPushEndpoint(subscription.endpoint)) {
      await db.update(pushSubscriptions).set({ enabled: false }).where(eq(pushSubscriptions.id, subscription.id));
      return;
    }
    const response = await fetch(subscription.endpoint, { method: "POST", redirect: "error", signal: AbortSignal.timeout(10000), headers: { Authorization: await authorization(subscription.endpoint), TTL: "86400", Urgency: "normal" }, body: null });
    const now = new Date().toISOString();
    if (response.ok || response.status === 201) await db.update(pushSubscriptions).set({ lastSuccessAt: now, lastFailureAt: null }).where(eq(pushSubscriptions.id, subscription.id));
    else await db.update(pushSubscriptions).set({ enabled: ![404, 410].includes(response.status), lastFailureAt: now }).where(eq(pushSubscriptions.id, subscription.id));
  }));
}
