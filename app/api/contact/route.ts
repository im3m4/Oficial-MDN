import { getDb } from "@/db";
import { contactSubmissions } from "@/db/schema";
import { allowRequest, InvalidBody, isSameOrigin, readJsonBounded } from "@/lib/request-security";
import { gavvelMessage, gavvelRoutes, isGavvelRoute } from "@/lib/gavvel";

const allowedRoutes = new Set(["Contratar a MEDYNA", "Trabajar con nosotros", "Proponer una alianza", "Presentar una idea", "Ofrecer servicios", "Oportunidad de negocio", "Compartir información", "Creadores y talento", "Prensa y medios", "Sugerencia general", ...gavvelRoutes]);
function text(value: unknown, max: number): string { return typeof value === "string" ? value.trim().slice(0, max) : ""; }

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Origen no autorizado." }, { status: 403 });
  try {
    const payload = await readJsonBounded(request, 8192);
    if (text(payload.website, 200)) return Response.json({ ok: true }, { status: 201 });
    const route = text(payload.route, 80); const name = text(payload.name, 120); const contact = text(payload.contact, 180);
    let message = text(payload.message, 5000);
    if (isGavvelRoute(route)) {
      try { message = gavvelMessage(payload); }
      catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Revisa los datos de tu objetivo." }, { status: 400 }); }
    }
    if (!allowedRoutes.has(route) || name.length < 2 || contact.length < 3 || message.length < 10) return Response.json({ error: "Revisa los campos obligatorios." }, { status: 400 });
    if (!(await allowRequest(request, "contact", 5, 3600))) return Response.json({ error: "Demasiados mensajes. Intenta más tarde." }, { status: 429, headers: { "Retry-After": "3600", "Cache-Control": "no-store" } });
    const reference = `MED-${crypto.randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase()}`;
    await getDb().insert(contactSubmissions).values({ reference, route, name, contact, message, organization: text(payload.organization, 180), location: text(payload.location, 180) });
    return Response.json({ ok: true, reference }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) { return Response.json({ error: error instanceof InvalidBody ? error.message : "No fue posible guardar el mensaje. Intenta nuevamente." }, { status: error instanceof InvalidBody ? error.status : 503 }); }
}
