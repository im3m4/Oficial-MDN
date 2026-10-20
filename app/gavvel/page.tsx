import type { Metadata } from "next";
import Link from "next/link";
import GavvelIntake from "./gavvel-intake";

const title = "AZTRA — Investigación y orientación estratégica | MEDYNA";
const description = "AZTRA abre su convocatoria inicial para objetivos de expansión empresarial, nuevos proyectos y colaboraciones. Una iniciativa de MEDYNA con vocación global.";

export const metadata: Metadata = {
  title, description,
  alternates: { canonical: "/aztra" },
  openGraph: { title, description, url: "https://xmedyna.com/aztra", siteName: "MEDYNA", locale: "es", type: "website", images: [{ url: "https://xmedyna.com/aztra-social.png", width: 1200, height: 630, alt: "AZTRA — Investigación y orientación estratégica. MEDYNA." }] },
  twitter: { card: "summary_large_image", title, description, images: ["https://xmedyna.com/aztra-social.png"] },
};

const lines = [
  { index: "01", title: "Expansión", text: "Nuevos mercados, capacidades y posibilidades de crecimiento. Un destino concreto y las condiciones para llegar." },
  { index: "02", title: "Nuevos proyectos", text: "De una intención a una iniciativa definida: qué se busca, qué hace falta y qué decisión viene después." },
  { index: "03", title: "Colaboración", text: "Empresas, oficinas de inversión familiar, fundaciones e instituciones con una pregunta relevante o una capacidad que aportar." },
];

export default function GavvelPage() {
  return (
    <main className="route-page gavvel-page">
      <header className="route-header"><Link className="brand" href="/" aria-label="MEDYNA, inicio">MEDYNA</Link><nav aria-label="Navegación de AZTRA"><Link href="/proyectos">Proyectos</Link><a href="#convocatoria">Convocatoria</a><a href="#presentar">Presentar objetivo ↗</a></nav></header>
      <section className="gavvel-hero" aria-labelledby="gavvel-title">
        <div className="gavvel-hero-top"><p className="section-label">MEDYNA / Investigación y orientación estratégica</p><span>Convocatoria inicial</span></div>
        <h1 id="gavvel-title">AZTRA</h1>
        <div className="gavvel-hero-bottom"><h2>El objetivo merece<br />una dirección.</h2><div><p>Una iniciativa de MEDYNA con vocación global, concebida para transformar objetivos de expansión y creación de proyectos en rutas de acción fundamentadas.</p><a className="button" href="#presentar">Presentar un objetivo <span aria-hidden="true">↗</span></a><small className="gavvel-status">Recepción de propuestas abierta. Servicio en preparación.</small></div></div>
      </section>
      <section className="gavvel-lines" aria-labelledby="gavvel-lines-title"><p className="section-label">Ámbitos de investigación</p><h2 id="gavvel-lines-title">Dónde queremos<br />aportar criterio.</h2><div className="gavvel-line-grid">{lines.map((line) => <article key={line.index}><span>{line.index}</span><h3>{line.title}</h3><p>{line.text}</p></article>)}</div></section>
      <section className="gavvel-invitation" id="convocatoria" aria-labelledby="gavvel-invitation-title"><div><p className="section-label">Primera convocatoria</p><h2 id="gavvel-invitation-title">Una pregunta real.<br />Un primer caso.</h2></div><div><p>Buscamos objetivos definidos y personas dispuestas a aportar contexto. Recibimos solicitudes de personas y organizaciones de cualquier escala, por invitación o presentación directa.</p><p>Las propuestas recibidas permitirán evaluar los primeros casos y las colaboraciones necesarias para desarrollar AZTRA.</p><dl><div><dt>Ahora</dt><dd>Recepción privada de propuestas y folio de confirmación.</dd></div><div><dt>En preparación</dt><dd>Comparación de rutas, planes de acción, revisión humana y seguimiento.</dd></div><div><dt>Después de la selección</dt><dd>El alcance, los responsables y las condiciones se acordarán antes de iniciar cualquier trabajo.</dd></div></dl><p className="gavvel-invitation-note">Enviar una propuesta no confirma admisión ni contratación.</p></div></section>
      <p className="aztra-guide-link"><a href="/guias/presentar-propuesta">Cómo preparar tu propuesta a AZTRA ↗</a></p>
      <GavvelIntake />
      <footer><Link className="brand" href="/">MEDYNA</Link><p><Link href="/contact">Contacto institucional</Link></p><p>AZTRA · © {new Date().getFullYear()}</p></footer>
    </main>
  );
}
