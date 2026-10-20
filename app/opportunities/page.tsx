import type { Metadata } from "next";
import { listPublishedContent } from "@/lib/content";

const title = "Solicitudes abiertas — MEDYNA";
const description = "Convocatorias y búsquedas concretas que MEDYNA ha decidido abrir públicamente.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/opportunities" },
  openGraph: { title, description, url: "https://xmedyna.com/opportunities", siteName: "MEDYNA", locale: "es_MX", type: "website", images: [] },
  twitter: { card: "summary", title, description, images: [] },
};

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage() {
  const items = await listPublishedContent("opportunity");
  return (
    <main className="route-page opportunities-page">
      <header className="route-header">
        <a className="brand" href="https://xmedyna.com/" aria-label="MEDYNA, volver al inicio">MEDYNA</a>
        <nav aria-label="Navegación secundaria"><a href="/jobs">Talento</a><span>Solicitudes abiertas</span></nav>
      </header>
      <section className="route-hero opportunities-hero">
        <p className="section-label">Convocatorias / Estado público</p>
        <h1>Búsquedas con<br />un propósito definido.</h1>
        <p>Publicamos una convocatoria cuando existe una necesidad concreta. Aquí encontrarás su alcance y los detalles disponibles para participar.</p>
      </section>
      <section className="opportunity-status" aria-labelledby="opportunity-status-title">
        <div><span className="status-dot" aria-hidden="true" /><span>Estado actual</span></div>
        <h2 id="opportunity-status-title">{items.length ? `${items.length} ${items.length === 1 ? "solicitud pública activa" : "solicitudes públicas activas"}.` : "Sin convocatorias públicas activas."}</h2>
        <p>{items.length ? "Estas convocatorias fueron aprobadas para publicación por MEDYNA." : "Puedes presentar una capacidad o propuesta relevante aun cuando no exista una convocatoria abierta."}</p>
        <a className="button" href="https://xmedyna.com/contact">Ofrecer una capacidad <span aria-hidden="true">→</span></a>
      </section>
      {items.length ? <section className="collection-grid opportunity-grid">{items.map((item) => <article key={item.id}><span>{item.location || "Solicitud abierta"}</span><h2>{item.title}</h2><p>{item.summary}</p>{item.body ? <div>{item.body}</div> : null}{item.startsAt ? <time dateTime={item.startsAt}>{new Date(`${item.startsAt}T12:00:00`).toLocaleDateString("es-MX", { dateStyle: "long" })}</time> : null}</article>)}</section> : null}
      <footer><a className="brand" href="https://xmedyna.com/">MEDYNA</a><p><a href="https://xmedyna.com/contact">Contacto institucional</a></p><p>© {new Date().getFullYear()}</p></footer>
    </main>
  );
}
