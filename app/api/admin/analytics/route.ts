import { desc, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { analyticsEvents, consentChoiceCounts, contactSubmissions, pushSubscriptions } from "@/db/schema";
import { requireApiAdmin } from "@/lib/admin-auth";

export async function GET() {
  const auth = await requireApiAdmin(); if ("response" in auth) return auth.response;
  try {
    const db = getDb();
    await db.delete(analyticsEvents).where(sql`${analyticsEvents.createdAt} < datetime('now', '-90 days')`);
    const [totals, paths, subscribers, choices, inquiries] = await Promise.all([
      db.select({ views: sql<number>`count(*)`, visitors: sql<number>`count(distinct ${analyticsEvents.sessionId})` }).from(analyticsEvents).where(sql`${analyticsEvents.createdAt} >= datetime('now', '-30 days')`),
      db.select({ path: analyticsEvents.path, views: sql<number>`count(*)` }).from(analyticsEvents).where(sql`${analyticsEvents.createdAt} >= datetime('now', '-30 days')`).groupBy(analyticsEvents.path).orderBy(desc(sql`count(*)`)).limit(12),
      db.select({ total: sql<number>`count(*)` }).from(pushSubscriptions).where(sql`${pushSubscriptions.enabled} = 1`),
      db.select({ choice: consentChoiceCounts.choice, total: sql<number>`sum(${consentChoiceCounts.count})` }).from(consentChoiceCounts).where(sql`${consentChoiceCounts.day} >= date('now', '-30 days')`).groupBy(consentChoiceCounts.choice),
      db.select({ route: contactSubmissions.route, total: sql<number>`count(*)` }).from(contactSubmissions).where(sql`${contactSubmissions.createdAt} >= datetime('now', '-30 days')`).groupBy(contactSubmissions.route).orderBy(desc(sql`count(*)`)).limit(10),
    ]);
    const consent = Object.fromEntries(choices.map((item) => [item.choice, Number(item.total)]));
    return Response.json({ views: Number(totals[0]?.views ?? 0), visitors: Number(totals[0]?.visitors ?? 0), subscribers: Number(subscribers[0]?.total ?? 0), essentialChoices: consent.essential ?? 0, analyticsChoices: consent.analytics ?? 0, paths: paths.map((item) => ({ ...item, views: Number(item.views) })), inquiries: inquiries.map((item) => ({ route: item.route, total: Number(item.total) })) }, { headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json({ error: "La analítica no está disponible." }, { status: 503 }); }
}
