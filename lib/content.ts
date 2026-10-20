import { and, asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { contentItems } from "@/db/schema";

export const contentTypes = ["opportunity", "job", "bulletin", "initiative", "research", "story", "event"] as const;
export const contentStatuses = ["draft", "published", "archived"] as const;
export type ContentType = (typeof contentTypes)[number];
export type ContentStatus = (typeof contentStatuses)[number];
export type ContentItem = typeof contentItems.$inferSelect;

export function isContentType(value: unknown): value is ContentType {
  return typeof value === "string" && contentTypes.includes(value as ContentType);
}

export function isContentStatus(value: unknown): value is ContentStatus {
  return typeof value === "string" && contentStatuses.includes(value as ContentStatus);
}

export function slugify(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

export async function listPublishedContent(type: ContentType): Promise<ContentItem[]> {
  try {
    return await getDb().select().from(contentItems)
      .where(and(eq(contentItems.type, type), eq(contentItems.status, "published")))
      .orderBy(asc(contentItems.startsAt), desc(contentItems.publishedAt), desc(contentItems.id));
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("unavailable") || message.includes("no such table")) return [];
    throw error;
  }
}
