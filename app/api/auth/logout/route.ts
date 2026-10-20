import { clearAdminSession } from "@/lib/admin-auth";
import { isSameOrigin } from "@/lib/request-security";
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Origen no autorizado." }, { status: 403 });
  await clearAdminSession();
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
