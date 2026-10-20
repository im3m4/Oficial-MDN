import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { contentItems } from "@/db/schema";
export async function GET() {
  const [item] = await getDb().select({ title: contentItems.title, summary: contentItems.summary, slug: contentItems.slug }).from(contentItems).where(and(eq(contentItems.type, "bulletin"), eq(contentItems.status, "published"))).orderBy(desc(contentItems.publishedAt), desc(contentItems.id)).limit(1);
  return Response.json(item ? { title: item.title, body: item.summary, url: "/bulletin" } : { title: "MEDYNA", body: "Hay una nueva publicación en el boletín.", url: "/bulletin" }, { headers: { "Cache-Control": "no-store" } });
}
