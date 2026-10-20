import type { Metadata } from "next";
import type { ReactNode } from "react";
import { discoveryPages, siteOrigin } from "@/lib/public-discovery";

export function informationMetadata(title: string, description: string, path: string): Metadata {
  return { title: `${title} — MEDYNA`, description, alternates: { canonical: path },
    openGraph: { title: `${title} — MEDYNA`, description, url: `${siteOrigin}${path}`, type: "website", siteName: "MEDYNA", locale: "es_MX" },
    twitter: { card: "summary", title: `${title} — MEDYNA`, description },
  };
}

export default function PublicInformation({ title, lead, path, children }: { title: string; lead: string; path: string; children: ReactNode }) {
  const breadcrumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "MEDYNA", item: siteOrigin },
    { "@type": "ListItem", position: 2, name: title, item: `${siteOrigin}${path}` },
  ] };
  return <main className="route-page information-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replaceAll("<", "\\u003c") }} />
    <header className="route-header"><a className="brand" href="/" aria-label="MEDYNA, inicio">MEDYNA</a><nav aria-label="Navegación secundaria"><a href="/proyectos">Proyectos</a><a href="/aztra">AZTRA</a><a href="/contact">Contacto</a></nav></header>
    <section className="information-heading"><p className="section-label">MEDYNA / Información pública</p><h1>{title}</h1><p>{lead}</p></section>
    <article className="information-body">{children}</article>
    <nav className="information-related" aria-label="Seguir leyendo"><p className="section-label">Seguir explorando</p>{discoveryPages.filter(page => page.path !== path).map(page => <a key={page.path} href={page.path}>{page.title}<span aria-hidden="true">↗</span></a>)}</nav>
    <footer><a className="brand" href="/">MEDYNA</a><p><a href="/contact">Contacto institucional</a></p><p><a href="/privacidad">Privacidad y avisos</a> · © {new Date().getFullYear()}</p></footer>
  </main>;
}
