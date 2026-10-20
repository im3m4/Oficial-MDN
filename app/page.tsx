"use client";
import Link from "next/link";
import { discoveryPages } from "@/lib/public-discovery";

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <Link className="brand" href="/" aria-label="MEDYNA, inicio">MEDYNA</Link>
        <nav aria-label="Navegación principal">
          <a href="/proyectos">Proyectos</a>
          <a href="/initiatives">Iniciativas</a>
          <a href="/research">Investigación</a>
          <a href="/opportunities">Oportunidades</a>
          <a href="/state">state</a>
          <a href="/archivo">Archivo</a>
        </nav>
        <div className="header-actions"><a className="nav-cta" href="/contact">Contacto</a></div>
      </header>

      <section className="hero home-hero">
        <img className="hero-image" src="/medyna-hero-monochrome.webp" alt="Pliegues oscuros y piedra en una composición abstracta" fetchPriority="high" />
        <div className="hero-shade" />
        <div className="hero-copy"><h1>MEDYNA</h1></div>
      </section>

      <section className="gavvel-feature" aria-labelledby="gavvel-feature-title">
        <div><p className="section-label">Proyecto destacado / MEDYNA</p><h2 id="gavvel-feature-title">AZTRA</h2><p className="gavvel-feature-description">Investigación y orientación estratégica para objetivos de expansión y nuevos proyectos.</p></div>
        <div className="gavvel-feature-aside"><p>Un objetivo definido.<br />Las preguntas que importan.<br />Una ruta por construir.</p><Link className="gavvel-text-link" href="/aztra">Conocer AZTRA <span aria-hidden="true">↗</span></Link><small className="gavvel-status">Convocatoria inicial abierta · Servicio en preparación.</small></div>
      </section>

      <section className="home-directions" aria-label="Explorar MEDYNA">
        <a href="/proyectos"><span>01 / Proyectos</span><h2>Lo que toma forma.</h2><p>Iniciativas, investigación y oportunidades.</p><strong>Explorar <span aria-hidden="true">↗</span></strong></a>
        <a href="/archivo"><span>02 / Archivo</span><h2>El registro de MEDYNA.</h2><p>Boletín, historias y encuentros.</p><strong>Leer <span aria-hidden="true">↗</span></strong></a>
        <a href="/contact"><span>03 / Contacto</span><h2>Un canal directo.</h2><p>Presenta tu propuesta y conserva un folio de recepción.</p><strong>Escribir <span aria-hidden="true">↗</span></strong></a>
      </section>

      <section className="home-discovery" aria-labelledby="home-discovery-title">
        <div><p className="section-label">Conoce MEDYNA</p><h2 id="home-discovery-title">Un punto de partida.</h2></div>
        <nav aria-label="Información sobre MEDYNA">{discoveryPages.map(page => <a key={page.path} href={page.path}><h3>{page.title}</h3><p>{page.description}</p><span aria-hidden="true">↗</span></a>)}</nav>
      </section>

      <footer className="home-footer" aria-label="Pie de página de MEDYNA">
        <div className="home-footer-top">
          <div className="home-footer-intro">
            <a className="brand" href="/" aria-label="MEDYNA, inicio">MEDYNA</a>
            <p>Una visión propia.<br />Un horizonte largo.</p>
            <span>Empresas, conocimiento y proyectos.</span>
          </div>
          <nav className="home-footer-nav" aria-label="Explorar MEDYNA desde el pie de página">
            <h2>Explorar</h2>
            <a href="/medyna">Qué es MEDYNA</a>
            <a href="/medyna#organizacion">Organización</a>
            <a href="/proyectos">Proyectos</a>
            <a href="/aztra">AZTRA</a>
            <a href="/state">state</a>
            <a href="/archivo">Archivo</a>
          </nav>
          <nav className="home-footer-nav" aria-label="Contacto y organización">
            <h2>Conectar</h2>
            <a href="/contact">Contacto institucional</a>
            <a href="/medina">Emanuel Medina · CEO</a>
            <a href="/preguntas-frecuentes">Preguntas frecuentes</a>
            <a href="/guias/presentar-propuesta">Guía de propuestas</a>
            <a href="/opportunities">Oportunidades</a>
            <a href="/login">Iniciar sesión</a>
          </nav>
        </div>
        <div className="home-footer-bottom">
          <span>© {new Date().getFullYear()} MEDYNA</span>
          <a href="/privacidad">Privacidad y avisos</a>
          <a href="/contact">Presenta tu propuesta <span aria-hidden="true">↗</span></a>
        </div>
      </footer>
    </main>
  );
}
