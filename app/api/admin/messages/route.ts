import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { contactSubmissions } from "@/db/schema";
import { requireApiAdmin } from "@/lib/admin-auth";
import { InvalidBody, isSameOrigin, readJsonBounded } from "@/lib/request-security";

export async function GET() {
  const auth = await requireApiAdmin(); if ("response" in auth) return auth.response;
  try { return Response.json({ items: await getDb().select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt), desc(contactSubmissions.id)) }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return Response.json({ error: "La bandeja no está disponible." }, { status: 503 }); }
}
export async function POST(request: Request) {
  const auth = await requireApiAdmin(); if ("response" in auth) return auth.response;
  if (!isSameOrigin(request)) return Response.json({ error: "Origen no autorizado." }, { status: 403 });
  let payload: Record<string, unknown>;
  try { payload = await readJsonBounded(request, 2048); }
  catch (error) { return Response.json({ error: error instanceof InvalidBody ? error.message : "Solicitud no válida." }, { status: error instanceof InvalidBody ? error.status : 400 }); }
  const id = Number(payload.id); const status = payload.status;
  if (!Number.isInteger(id) || !["new", "read", "archived"].includes(String(status))) return Response.json({ error: "Actualización no válida." }, { status: 400 });
  const [item] = await getDb().update(contactSubmissions).set({ status: String(status), updatedAt: new Date().toISOString() }).where(eq(contactSubmissions.id, id)).returning();
  return item ? Response.json({ item }, { headers: { "Cache-Control": "no-store" } }) : Response.json({ error: "Mensaje no encontrado." }, { status: 404 });
}
