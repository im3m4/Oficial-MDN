import PublicCollection from "@/app/public-collection";

export const metadata = { title: "Talento — MEDYNA", description: "Posiciones y colaboraciones profesionales abiertas en MEDYNA.", alternates: { canonical: "/jobs" } };
export default function JobsPage() {
  return <PublicCollection type="job" eyebrow="Talento" title="Personas que elevan la obra." description="Posiciones y colaboraciones que abrimos cuando una nueva capacidad necesita incorporarse." empty="No hay posiciones abiertas en este momento." />;
}
