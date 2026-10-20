import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proyectos — MEDYNA",
  description: "Iniciativas, investigación, convocatorias y talento en el universo MEDYNA.",
  alternates: { canonical: "/proyectos" },
};

const sections = [
  { index: "00", name: "AZTRA", detail: "Investigación y orientación estratégica. Convocatoria inicial abierta.", href: "/aztra" },
  { index: "01", name: "Iniciativas", detail: "Proyectos presentados públicamente.", href: "/initiatives" },
  { index: "02", name: "Investigación", detail: "Líneas de estudio y hallazgos.", href: "/research" },
  { index: "03", name: "Oportunidades", detail: "Convocatorias y capacidades que buscamos.", href: "/opportunities" },
  { index: "04", name: "Talento", detail: "Posiciones y colaboraciones abiertas.", href: "/jobs" },
];

export default function ProjectsPage() {
  return (
    <main className="route-page archive-page projects-page">
      <header className="route-header"><a className="brand" href="https://xmedyna.com/">MEDYNA</a><nav aria-label="Navegación secundaria"><a href="/archivo">Archivo</a><span>Proyectos</span></nav></header>
      <section className="archive-heading">
        <p className="section-label">MEDYNA / Proyectos</p>
        <h1>Del criterio<br />a la acción.</h1>
        <p>Las líneas de trabajo que decidimos mostrar, junto con las convocatorias abiertas para desarrollarlas.</p>
      </section>
      <nav className="archive-list" aria-label="Áreas de proyectos">
        {sections.map(section => <a href={section.href} key={section.index}><span>{section.index}</span><h2>{section.name}</h2><p>{section.detail}</p><strong aria-hidden="true">↗</strong></a>)}
      </nav>
      <footer><a className="brand" href="https://xmedyna.com/">MEDYNA</a><p><a href="/contact">Contacto institucional</a></p><p>© {new Date().getFullYear()}</p></footer>
    </main>
  );
}
