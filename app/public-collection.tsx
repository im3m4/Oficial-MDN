import type { ContentType } from "@/lib/content";
import { listPublishedContent } from "@/lib/content";

export default async function PublicCollection({ type, eyebrow, title, description, empty }: { type: ContentType; eyebrow: string; title?: string; description?: string; empty: string }) {
  const items = await listPublishedContent(type);
  return (
    <main className="route-page collection-page">
      <header className="route-header"><a className="brand" href="https://xmedyna.com/">MEDYNA</a><nav><a href={type === "initiative" || type === "research" || type === "job" ? "/proyectos" : "/archivo"}>Volver</a><span>{eyebrow}</span></nav></header>
      <section className={`route-hero collection-hero${title ? "" : " collection-hero-compact"}`} aria-label={eyebrow}><p className="section-label">{eyebrow}</p>{title && <h1>{title}</h1>}{description && <p>{description}</p>}</section>
      <section className={`public-collection ${type === "bulletin" ? "bulletin-collection" : ""}`} aria-live="polite">
        {items.length === 0 ? <div className="collection-empty"><span>Archivo público</span><h2>{empty}</h2><p>Las nuevas publicaciones aparecerán aquí cuando estén listas para hacerse públicas.</p></div> : <div className="collection-grid">{items.map((item) => <article key={item.id}><span>{item.location || eyebrow}</span>{type !== "bulletin" || item.title !== "Nota breve" ? <h2>{item.title}</h2> : null}{type === "bulletin" ? <div>{item.body || item.summary}</div> : <><p>{item.summary}</p>{item.body ? <div>{item.body}</div> : null}</>}{item.publishedAt && type === "bulletin" ? <time dateTime={item.publishedAt}>{new Date(item.publishedAt).toLocaleDateString("es-MX", { dateStyle: "long" })}</time> : item.startsAt ? <time dateTime={item.startsAt}>{new Date(`${item.startsAt}T12:00:00`).toLocaleDateString("es-MX", { dateStyle: "long" })}</time> : null}</article>)}</div>}
      </section>
      <footer><a className="brand" href="https://xmedyna.com/">MEDYNA</a><p><a href="https://xmedyna.com/contact">Contacto institucional</a></p><p>© {new Date().getFullYear()}</p></footer>
    </main>
  );
}
