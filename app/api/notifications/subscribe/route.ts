import { isAllowedPushEndpoint, isValidPushKeys } from "@/lib/push-security.mjs";
import { getDb } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { allowRequest, InvalidBody, isSameOrigin, readJsonBounded } from "@/lib/request-security";
import { allowsAnalytics, consentCookieName, cookieValue } from "@/lib/consent";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Origen no autorizado." }, { status: 403 });
  if (!allowsAnalytics(cookieValue(request.headers.get("cookie"), consentCookieName))) return Response.json({ error: "Se necesita consentimiento." }, { status: 403 });
  let payload: Record<string, unknown>;
  try { payload = await readJsonBounded(request, 4096); }
  catch (error) { return Response.json({ error: error instanceof InvalidBody ? error.message : "Solicitud no válida." }, { status: error instanceof InvalidBody ? error.status : 400 }); }
  const keys = payload.keys && typeof payload.keys === "object" && !Array.isArray(payload.keys) ? payload.keys as Record<string, unknown> : {};
  const endpoint = typeof payload.endpoint === "string" ? payload.endpoint : ""; const p256dh = typeof keys.p256dh === "string" ? keys.p256dh : ""; const auth = typeof keys.auth === "string" ? keys.auth : "";
  if (!isAllowedPushEndpoint(endpoint) || !isValidPushKeys(p256dh, auth)) return Response.json({ error: "Suscripción no válida." }, { status: 400 });
  if (!(await allowRequest(request, "push-subscribe", 15, 3600))) return Response.json({ error: "Demasiados intentos. Intenta más tarde." }, { status: 429, headers: { "Retry-After": "3600" } });
  await getDb().insert(pushSubscriptions).values({ endpoint, p256dh, auth }).onConflictDoUpdate({ target: pushSubscriptions.endpoint, set: { p256dh, auth, enabled: true } });
  return Response.json({ ok: true }, { status: 201 });
}
