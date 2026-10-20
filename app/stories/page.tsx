import type { Metadata } from "next";
import PublicCollection from "@/app/public-collection";

export const dynamic = "force-dynamic";
const title = "Historias — MEDYNA";
const description = "Relatos, perfiles y conversaciones del universo MEDYNA.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/stories" }, openGraph: { title, description, url: "https://xmedyna.com/stories", images: [] }, twitter: { title, description, images: [] } };

export default function StoriesPage() {
  return <PublicCollection type="story" eyebrow="Historias" title="Las personas detrás de las ideas." description="Relatos y conversaciones que muestran cómo se piensa y se construye dentro de MEDYNA." empty="Aún no hay historias en el archivo." />;
}
