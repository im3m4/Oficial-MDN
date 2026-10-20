import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Archivo público — MEDYNA",
  description: "Boletín, historias y encuentros públicos de MEDYNA.",
  alternates: { canonical: "https://xmedyna.com/archivo" },
};

const sections = [
  { index: "01", name: "Boletín", detail: "Notas, anuncios e informes.", href: "/bulletin" },
  { index: "02", name: "Historias", detail: "Relatos y conversaciones.", href: "/stories" },
  { index: "03", name: "Encuentros", detail: "Actividades anunciadas.", href: "/events" },
];

export default function ArchivePage() {
  return (
    <main className="route-page archive-page">
      <header className="route-header"><a className="brand" href="https://xmedyna.com/">MEDYNA</a><nav aria-label="Navegación secundaria"><a href="https://xmedyna.com/">Grupo</a><span>Archivo público</span></nav></header>
      <section className="archive-heading">
        <p className="section-label">MEDYNA / Archivo público</p>
        <h1>Lo que decidimos<br />hacer público.</h1>
        <p>Notas y conversaciones que forman parte de nuestro registro abierto.</p>
      </section>
      <nav className="archive-list" aria-label="Secciones del archivo">
        {sections.map(section => <a href={section.href} key={section.index}><span>{section.index}</span><h2>{section.name}</h2><p>{section.detail}</p><strong aria-hidden="true">↗</strong></a>)}
      </nav>
      <footer><a className="brand" href="https://xmedyna.com/">MEDYNA</a><p><a href="https://xmedyna.com/contact">Contacto institucional</a></p><p>© {new Date().getFullYear()}</p></footer>
    </main>
  );
}
