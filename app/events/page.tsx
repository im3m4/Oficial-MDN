import type { Metadata } from "next";
import PublicCollection from "@/app/public-collection";

export const dynamic = "force-dynamic";
const title = "Eventos — MEDYNA";
const description = "Encuentros y actividades de MEDYNA abiertos al público.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/events" }, openGraph: { title, description, url: "https://xmedyna.com/events", images: [] }, twitter: { title, description, images: [] } };

export default function EventsPage() {
  return <PublicCollection type="event" eyebrow="Encuentros" title="El valor de estar presentes." description="Encuentros y actividades que MEDYNA decide abrir a una audiencia pública." empty="No hay encuentros públicos anunciados." />;
}
