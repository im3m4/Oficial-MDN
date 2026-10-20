import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacidad y avisos — MEDYNA",
  description: "Cómo funcionan las opciones de cookies, medición de visitas y avisos de MEDYNA.",
  alternates: { canonical: "/privacidad" },
};

export default function PrivacyPage() {
  return <main className="route-page privacy-page">
    <header className="route-header"><Link className="brand" href="/">MEDYNA</Link><nav aria-label="Navegación secundaria"><Link href="/">Volver al sitio</Link><span>Privacidad y avisos</span></nav></header>
    <article className="privacy-content">
      <p className="section-label">MEDYNA / Privacidad</p>
      <h1>Tu elección,<br />con claridad.</h1>
      <p className="privacy-intro">Puedes usar el sitio con solo las cookies necesarias o permitir una medición propia de visitas y solicitar avisos de nuevos boletines.</p>
      <section><h2>Solo las necesarias</h2><p>Guardamos tu elección en una cookie durante 180 días. En el panel privado conservamos únicamente un conteo diario de cuántas veces se elige cada opción, sin asociarlo a una persona. No registramos tus páginas visitadas para analítica.</p></section>
      <section><h2>Aceptar todas</h2><p>Además de lo anterior, registramos la ruta de cada página visitada y un identificador de sesión seudónimo. Los usamos para ver, de forma agregada, qué contenidos interesan más. La cookie de sesión dura 30 días y los registros de visitas se eliminan después de 90 días.</p><p>También pedimos por separado el permiso del navegador para avisos de nuevos boletines. Si lo concedes, guardamos los datos técnicos necesarios para enviarlos. No usamos estas mediciones para publicidad ni para crear perfiles comerciales individuales.</p></section>
      <section><h2>Cambiar tu elección</h2><p>Puedes abrir «Privacidad y avisos» desde la esquina inferior del sitio y elegir de nuevo. Al cambiar a «Solo las necesarias», detenemos la medición, retiramos los registros de la sesión de este navegador y cancelamos su suscripción a avisos. También puedes revocar los avisos desde la configuración del navegador.</p></section>
      <section><h2>Mensajes que envías</h2><p>Si utilizas el formulario de contacto, los datos que escribas se guardan aparte y son visibles en la bandeja privada de MEDYNA para atender tu solicitud. Las métricas de esta página no vinculan esos mensajes con tu sesión de navegación.</p></section>
      <p className="privacy-contact">Si tienes una duda sobre estos usos, puedes escribirnos desde <Link href="/contact">Contacto institucional ↗</Link>.</p>
    </article>
    <footer><Link className="brand" href="/">MEDYNA</Link><p><Link href="/contact">Contacto institucional</Link></p><p>© {new Date().getFullYear()}</p></footer>
  </main>;
}
