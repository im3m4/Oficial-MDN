import { InvalidBody, isSameOrigin, readJsonBounded } from "@/lib/request-security";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { contentAudit, contentItems } from "@/db/schema";
import { requireApiAdmin } from "@/lib/admin-auth";
import { isContentStatus, isContentType, slugify } from "@/lib/content";
import { notifyBulletinSubscribers } from "@/lib/web-push";

export const dynamic = "force-dynamic";

function noStore(payload: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  return Response.json(payload, { ...init, headers });
}

function messageFor(error: unknown): string {
  const message = error instanceof Error ? error.message : "Error inesperado.";
  if (message.includes("UNIQUE constraint failed")) return "Ya existe una publicación con ese identificador.";
  if (message.includes("no such table") || message.includes("unavailable")) return "La base editorial todavía no está disponible.";
  return "No se pudo completar la operación.";
}

export async function GET() {
  const auth = await requireApiAdmin();
  if ("response" in auth) return auth.response;
  try {
    const items = await getDb().select().from(contentItems).orderBy(desc(contentItems.updatedAt), desc(contentItems.id));
    return noStore({ items });
  } catch (error) {
    return noStore({ error: messageFor(error) }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const auth = await requireApiAdmin();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(request)) return noStore({ error: "Origen no autorizado." }, { status: 403 });

  try {
    const payload = await readJsonBounded(request, 65536);
    const action = payload.action;
    const db = getDb();

    if (action === "quick-publish") {
      const body = typeof payload.body === "string" ? payload.body.trim() : "";
      const suppliedTitle = typeof payload.title === "string" ? payload.title.trim() : "";
      const location = typeof payload.location === "string" ? payload.location.trim() : "Actualización";
      if (!body || body.length > 2000 || suppliedTitle.length > 140 || !["Actualización", "Noticia", "Informe"].includes(location)) {
        return noStore({ error: "Escribe una nota de hasta 2000 caracteres y revisa el título." }, { status: 400 });
      }
      const title = suppliedTitle || "Nota breve";
      const now = new Date().toISOString();
      const slug = `${slugify(title).slice(0, 60) || "nota"}-${crypto.randomUUID().slice(0, 8)}`;
      const [item] = await db.insert(contentItems).values({
        type: "bulletin", slug, title, summary: body.slice(0, 360), body,
        location, status: "published", publishedAt: now,
        createdBy: auth.user.userId, updatedBy: auth.user.userId,
      }).returning();
      await db.insert(contentAudit).values({ contentItemId: item.id, action: "quick-published", actorUserId: auth.user.userId });
      try { await notifyBulletinSubscribers(); } catch (error) { console.error("Bulletin notification failed", error); }
      return noStore({ item }, { status: 201 });
    }

    if (action === "create") {
      const type = payload.type;
      const title = typeof payload.title === "string" ? payload.title.trim() : "";
      const summary = typeof payload.summary === "string" ? payload.summary.trim() : "";
      if (!isContentType(type) || !title || !summary) return noStore({ error: "Tipo, título y resumen son obligatorios." }, { status: 400 });
      const slug = slugify(typeof payload.slug === "string" && payload.slug.trim() ? payload.slug : title);
      if (!slug) return noStore({ error: "El identificador público no es válido." }, { status: 400 });
      const [item] = await db.insert(contentItems).values({
        type, slug, title, summary,
        body: typeof payload.body === "string" ? payload.body.trim() : "",
        location: typeof payload.location === "string" ? payload.location.trim() : "",
        startsAt: typeof payload.startsAt === "string" && payload.startsAt ? payload.startsAt : null,
        createdBy: auth.user.userId, updatedBy: auth.user.userId,
      }).returning();
      await db.insert(contentAudit).values({ contentItemId: item.id, action: "created", actorUserId: auth.user.userId });
      return noStore({ item }, { status: 201 });
    }

    if (action === "update") {
      const id = Number(payload.id);
      const status = payload.status;
      const title = typeof payload.title === "string" ? payload.title.trim() : "";
      const summary = typeof payload.summary === "string" ? payload.summary.trim() : "";
      const type = payload.type;
      if (!Number.isInteger(id) || !isContentType(type) || !isContentStatus(status) || !title || !summary) return noStore({ error: "La actualización no es válida." }, { status: 400 });
      const [previous] = await db.select().from(contentItems).where(eq(contentItems.id, id)).limit(1);
      if (!previous) return noStore({ error: "Publicación no encontrada." }, { status: 404 });
      const publishedAt = status === "published" ? (previous.publishedAt ?? new Date().toISOString()) : null;
      const [item] = await db.update(contentItems).set({
        type, title, summary,
        body: typeof payload.body === "string" ? payload.body.trim() : "",
        location: typeof payload.location === "string" ? payload.location.trim() : "",
        startsAt: typeof payload.startsAt === "string" && payload.startsAt ? payload.startsAt : null,
        status, publishedAt, updatedBy: auth.user.userId, updatedAt: new Date().toISOString(),
      }).where(eq(contentItems.id, id)).returning();
      if (!item) return noStore({ error: "Publicación no encontrada." }, { status: 404 });
      await db.insert(contentAudit).values({ contentItemId: item.id, action: `status:${status}`, actorUserId: auth.user.userId });
      if (item.type === "bulletin" && status === "published" && previous.status !== "published") await notifyBulletinSubscribers();
      return noStore({ item });
    }

    return noStore({ error: "Acción no reconocida." }, { status: 400 });
  } catch (error) {
    if (error instanceof InvalidBody) return noStore({ error: error.message }, { status: error.status });
    return noStore({ error: messageFor(error) }, { status: 500 });
  }
}
