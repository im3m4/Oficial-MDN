import type { Metadata } from "next";
import PublicCollection from "@/app/public-collection";

export const dynamic = "force-dynamic";
const title = "Iniciativas — MEDYNA";
const description = "Iniciativas que MEDYNA decide presentar públicamente, desde su planteamiento hasta sus avances.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/initiatives" }, openGraph: { title, description, url: "https://xmedyna.com/initiatives", images: [] }, twitter: { title, description, images: [] } };

export default function InitiativesPage() {
  return <PublicCollection type="initiative" eyebrow="Iniciativas" empty="Aún no hay iniciativas públicas." />;
}
