import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { analyticsEvents } from "@/db/schema";
import { allowsAnalytics, analyticsPath, analyticsSessionCookieName, consentCookieName, cookieValue } from "@/lib/consent";
import { allowRequest, InvalidBody, isSameOrigin, readJsonBounded } from "@/lib/request-security";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return new Response(null, { status: 403 });
  const cookies = request.headers.get("cookie");
  if (!allowsAnalytics(cookieValue(cookies, consentCookieName))) return new Response(null, { status: 403 });
  let payload: Record<string, unknown>;
  try { payload = await readJsonBounded(request, 512); }
  catch (error) { return new Response(null, { status: error instanceof InvalidBody ? error.status : 400 }); }
  const path = analyticsPath(payload.path);
  if (!path) return new Response(null, { status: 400 });
  const existing = cookieValue(cookies, analyticsSessionCookieName);
  const sessionId = uuid.test(existing) ? existing : crypto.randomUUID();
  try {
    if (!(await allowRequest(request, "analytics-view", 120, 60))) return new Response(null, { status: 429, headers: { "Retry-After": "60" } });
    const db = getDb();
    await db.delete(analyticsEvents).where(sql`${analyticsEvents.createdAt} < datetime('now', '-90 days')`);
    await db.insert(analyticsEvents).values({ path, sessionId });
  } catch { return new Response(null, { status: 503 }); }
  return new Response(null, { status: 204, headers: {
    "Cache-Control": "no-store",
    "Set-Cookie": `${analyticsSessionCookieName}=${sessionId}; Path=/; Max-Age=${30 * 86400}; SameSite=Lax; Secure; HttpOnly`,
  } });
}
