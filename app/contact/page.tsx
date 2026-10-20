/* eslint-disable @next/next/no-html-link-for-pages */
import type { Metadata } from "next";
import ContactPortal from "./contact-portal";

const title = "Contacto — MEDYNA";
const description = "Canal institucional para presentar propuestas, alianzas, talento y oportunidades a MEDYNA.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/contact" },
  openGraph: { title, description, url: "https://xmedyna.com/contact", siteName: "MEDYNA", locale: "es_MX", type: "website", images: [] },
  twitter: { card: "summary", title, description, images: [] },
};

export default function ContactPage() {
  return (
    <main className="route-page">
      <header className="route-header">
        <a className="brand" href="/" aria-label="MEDYNA, volver al inicio">MEDYNA</a>
        <nav aria-label="Navegación secundaria"><a href="/opportunities">Solicitudes abiertas</a><a href="/login">Iniciar sesión</a><span>Contacto institucional</span></nav>
      </header>
      <section className="route-hero">
        <p className="section-label">Contacto institucional</p>
        <h1>Una buena propuesta<br />abre una conversación.</h1>
        <p>Cuéntanos qué planteas, por qué importa y dónde podríamos encontrarnos. Leemos propuestas de personas y organizaciones de cualquier escala.</p>
        <a className="button" href="#entries">Presentar una propuesta <span aria-hidden="true">↓</span></a>
      </section>
      <ContactPortal />
      <footer><a className="brand" href="/">MEDYNA</a><p><a href="/contact">Contacto institucional</a></p><p>© {new Date().getFullYear()}</p></footer>
    </main>
  );
}
