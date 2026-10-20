import { vapidPublicKey } from "@/lib/web-push";
export async function GET() { const publicKey = vapidPublicKey(); return publicKey ? Response.json({ publicKey }) : Response.json({ error: "Notificaciones no configuradas." }, { status: 503 }); }
