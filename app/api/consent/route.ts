import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { analyticsEvents, consentChoiceCounts } from "@/db/schema";
import { analyticsSessionCookieName, consentCookieName, cookieValue, type ConsentChoice } from "@/lib/consent";
import { allowRequest, InvalidBody, isSameOrigin, readJsonBounded } from "@/lib/request-security";

const cookieAge = 180 * 86400;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return new Response(null, { status: 403 });
  let payload: Record<string, unknown>;
  try { payload = await readJsonBounded(request, 128); }
  catch (error) { return new Response(null, { status: error instanceof InvalidBody ? error.status : 400 }); }
  if (payload.choice !== "essential" && payload.choice !== "analytics") return new Response(null, { status: 400 });

  const choice = payload.choice as ConsentChoice;
  const cookies = request.headers.get("cookie");
  const previous = cookieValue(cookies, consentCookieName);
  const previousChoice = previous === "analytics_notifications" ? "analytics" : previous;
  const sessionId = cookieValue(cookies, analyticsSessionCookieName);
  try {
    if (!(await allowRequest(request, "consent", 60, 60))) return new Response(null, { status: 429, headers: { "Retry-After": "60" } });
    const db = getDb();
    if (previousChoice !== choice) {
      await db.insert(consentChoiceCounts).values({ day: new Date().toISOString().slice(0, 10), choice, count: 1 })
        .onConflictDoUpdate({ target: [consentChoiceCounts.day, consentChoiceCounts.choice], set: { count: sql`${consentChoiceCounts.count} + 1` } });
    }
    if (choice === "essential" && uuid.test(sessionId)) await db.delete(analyticsEvents).where(eq(analyticsEvents.sessionId, sessionId));
  } catch { return new Response(null, { status: 503 }); }

  const headers = new Headers({ "Cache-Control": "no-store" });
  headers.append("Set-Cookie", `${consentCookieName}=${choice}; Path=/; Max-Age=${cookieAge}; SameSite=Lax; Secure`);
  if (choice === "essential") headers.append("Set-Cookie", `${analyticsSessionCookieName}=; Path=/; Max-Age=0; SameSite=Lax; Secure; HttpOnly`);
  return new Response(null, { status: 204, headers });
}
