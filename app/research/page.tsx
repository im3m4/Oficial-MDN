import type { Metadata } from "next";
import PublicCollection from "@/app/public-collection";

export const dynamic = "force-dynamic";
const title = "Investigación — MEDYNA";
const description = "Preguntas, estudios y hallazgos que MEDYNA decide compartir públicamente.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/research" }, openGraph: { title, description, url: "https://xmedyna.com/research", images: [] }, twitter: { title, description, images: [] } };

export default function ResearchPage() {
  return <PublicCollection type="research" eyebrow="Investigación" title="Primero, comprender." description="Líneas de estudio y hallazgos que forman parte del archivo público de MEDYNA." empty="La investigación pública aún no tiene entradas." />;
}
