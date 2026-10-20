import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { adminLoginAttempts } from "@/db/schema";
import { setAdminSession, verifyAdminCredentials } from "@/lib/admin-auth";
import { allowRequest, InvalidBody, isSameOrigin, readJsonBounded, requestKey } from "@/lib/request-security";
export async function POST(request: Request) {
  if (new URL(request.url).hostname !== "xmedyna.com" || !isSameOrigin(request)) return Response.json({ error: "Origen no autorizado." }, { status: 403 });
  let payload: Record<string, unknown>;
  try { payload = await readJsonBounded(request, 2048); }
  catch (error) { return Response.json({ error: error instanceof InvalidBody ? error.message : "Solicitud no válida." }, { status: error instanceof InvalidBody ? error.status : 400 }); }
  if (!(await allowRequest(request, "login-requests", 10, 900))) return Response.json({ error: "Demasiados intentos. Espera 15 minutos." }, { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": "900" } });
  const db = getDb(); const ipHash = await requestKey(request, "admin-login"); const [attempt] = await db.select().from(adminLoginAttempts).where(eq(adminLoginAttempts.ipHash, ipHash)).limit(1);
  if (attempt?.lockedUntil && new Date(attempt.lockedUntil).getTime() > Date.now()) return Response.json({ error: "Demasiados intentos. Espera 15 minutos." }, { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": "900" } });
  const email = typeof payload.email === "string" ? payload.email : ""; const password = typeof payload.password === "string" ? payload.password : "";
  if (!(await verifyAdminCredentials(email, password))) {
    const recent = attempt && Date.now() - new Date(attempt.updatedAt).getTime() < 15 * 60 * 1000 ? attempt.failedCount : 0; const failedCount = recent + 1; const lockedUntil = failedCount >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;
    await db.insert(adminLoginAttempts).values({ ipHash, failedCount, lockedUntil, updatedAt: new Date().toISOString() }).onConflictDoUpdate({ target: adminLoginAttempts.ipHash, set: { failedCount, lockedUntil, updatedAt: new Date().toISOString() } });
    return Response.json({ error: failedCount >= 5 ? "Demasiados intentos. Espera 15 minutos." : "Correo o contraseña incorrectos." }, { status: failedCount >= 5 ? 429 : 401, headers: { "Cache-Control": "no-store" } });
  }
  if (attempt) await db.delete(adminLoginAttempts).where(eq(adminLoginAttempts.ipHash, ipHash));
  await setAdminSession(email); return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
