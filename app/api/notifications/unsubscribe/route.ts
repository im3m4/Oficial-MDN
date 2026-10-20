import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { InvalidBody, isSameOrigin, readJsonBounded } from "@/lib/request-security";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return new Response(null, { status: 403 });
  let payload: Record<string, unknown>;
  try { payload = await readJsonBounded(request, 2200); }
  catch (error) { return new Response(null, { status: error instanceof InvalidBody ? error.status : 400 }); }
  const endpoint = payload.endpoint;
  if (typeof endpoint !== "string" || !endpoint.startsWith("https://") || endpoint.length > 2000) return new Response(null, { status: 400 });
  try { await getDb().delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint)); }
  catch { return new Response(null, { status: 503 }); }
  return new Response(null, { status: 204 });
}
