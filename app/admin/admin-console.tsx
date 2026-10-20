"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { ContentItem, ContentStatus, ContentType } from "@/lib/content";

const sections: Array<{ type: ContentType; label: string; publicPath: string }> = [
  { type: "opportunity", label: "Solicitudes", publicPath: "/opportunities" },
  { type: "job", label: "Puestos", publicPath: "/jobs" },
  { type: "bulletin", label: "Noticias e informes", publicPath: "/bulletin" },
  { type: "initiative", label: "Iniciativas", publicPath: "/initiatives" },
  { type: "research", label: "Investigación", publicPath: "/research" },
  { type: "story", label: "Historias", publicPath: "/stories" },
  { type: "event", label: "Eventos", publicPath: "/events" },
];

const statusLabels: Record<ContentStatus, string> = { draft: "Borrador", published: "Publicado", archived: "Archivado" };
type MessageStatus = "new" | "read" | "archived";
type InboxItem = { id: number; reference: string | null; route: string; name: string; contact: string; organization: string; location: string; message: string; status: MessageStatus; createdAt: string; updatedAt: string };
type AnalyticsSummary = { views: number; visitors: number; subscribers: number; essentialChoices: number; analyticsChoices: number; paths: Array<{ path: string; views: number }>; inquiries: Array<{ route: string; total: number }> };
type EditorValues = { id?: number; type: ContentType; title: string; summary: string; body: string; location: string; startsAt: string; status: ContentStatus };
const emptyEditor: EditorValues = { type: "opportunity", title: "", summary: "", body: "", location: "", startsAt: "", status: "draft" };

export default function AdminConsole({ displayName }: { displayName: string }) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [messages, setMessages] = useState<InboxItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({ views: 0, visitors: 0, subscribers: 0, essentialChoices: 0, analyticsChoices: 0, paths: [], inquiries: [] });
  const [activePanel, setActivePanel] = useState<ContentType | "inbox" | "analytics">("bulletin");
  const [quickTitle, setQuickTitle] = useState("");
  const [quickBody, setQuickBody] = useState("");
  const [quickCategory, setQuickCategory] = useState("Actualización");
  const [quickSaving, setQuickSaving] = useState(false);
  const [quickNotice, setQuickNotice] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<InboxItem | null>(null);
  const [editor, setEditor] = useState<EditorValues>(emptyEditor);
  const [state, setState] = useState<"loading" | "ready" | "saving" | "error">("loading");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/admin/content", { credentials: "same-origin", cache: "no-store" }).then(async (response) => ({ response, payload: await response.json() as { items?: ContentItem[]; error?: string } })),
      fetch("/api/admin/messages", { credentials: "same-origin", cache: "no-store" }).then(async (response) => ({ response, payload: await response.json() as { items?: InboxItem[]; error?: string } })),
      fetch("/api/admin/analytics", { credentials: "same-origin", cache: "no-store" }).then(async (response) => ({ response, payload: await response.json() as AnalyticsSummary & { error?: string } })),
    ]).then(([content, inbox, metrics]) => {
      if (!active) return;
      if (!content.response.ok || !inbox.response.ok) { setNotice(content.payload.error ?? inbox.payload.error ?? "No fue posible abrir el control."); setState("error"); return; }
      setItems(content.payload.items ?? []); setMessages(inbox.payload.items ?? []); if (metrics.response.ok) setAnalytics(metrics.payload); setState("ready");
    }).catch(() => { if (active) { setNotice("No fue posible abrir el control."); setState("error"); } });
    return () => { active = false; };
  }, []);

  const visibleItems = useMemo(() => activePanel === "inbox" || activePanel === "analytics" ? [] : items.filter((item) => item.type === activePanel), [items, activePanel]);
  const activeSection = activePanel === "inbox" || activePanel === "analytics" ? null : sections.find((section) => section.type === activePanel)!;
  const title = activePanel === "inbox" ? "Bandeja" : activePanel === "analytics" ? "Analítica" : activeSection!.label;

  const selectSection = (type: ContentType) => { setActivePanel(type); setEditor({ ...emptyEditor, type }); setSelectedMessage(null); setNotice(""); };
  const editItem = (item: ContentItem) => { setEditor({ id: item.id, type: item.type as ContentType, title: item.title, summary: item.summary, body: item.body, location: item.location, startsAt: item.startsAt ?? "", status: item.status as ContentStatus }); document.getElementById("content-editor")?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setState("saving"); setNotice("");
    const response = await fetch("/api/admin/content", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: editor.id ? "update" : "create", ...editor }) });
    const payload = await response.json() as { item?: ContentItem; error?: string };
    if (!response.ok || !payload.item) { setNotice(payload.error ?? "No se pudo guardar."); setState("error"); return; }
    setItems((current) => editor.id ? current.map((item) => item.id === payload.item!.id ? payload.item! : item) : [payload.item!, ...current]);
    setEditor({ ...emptyEditor, type: activePanel === "inbox" || activePanel === "analytics" ? "opportunity" : activePanel }); setNotice(editor.id ? "Cambios guardados." : "Borrador creado."); setState("ready");
  };

  const publishQuick = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setQuickSaving(true); setQuickNotice("");
    try {
      const response = await fetch("/api/admin/content", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "quick-publish", title: quickTitle, body: quickBody, location: quickCategory }) });
      const payload = await response.json() as { item?: ContentItem; error?: string };
      if (!response.ok || !payload.item) { setQuickNotice(payload.error ?? "No se pudo publicar. Conservamos tu texto."); return; }
      setItems((current) => [payload.item!, ...current]); setQuickTitle(""); setQuickBody(""); setQuickNotice("Publicado. Ya aparece en el boletín público.");
    } catch { setQuickNotice("No se pudo publicar. Conservamos tu texto."); }
    finally { setQuickSaving(false); }
  };

  const updateMessage = async (item: InboxItem, status: MessageStatus) => {
    const response = await fetch("/api/admin/messages", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, status }) });
    const payload = await response.json() as { item?: InboxItem; error?: string };
    if (!response.ok || !payload.item) { setNotice(payload.error ?? "No fue posible actualizar el mensaje."); return; }
    setMessages((current) => current.map((message) => message.id === payload.item!.id ? payload.item! : message)); setSelectedMessage(payload.item);
  };

  const logout = async () => { await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }); window.location.assign("/"); };

  return <main className="admin-shell">
    <aside className="admin-sidebar"><a className="admin-wordmark" href="/admin">MEDYNA <span>COMPANY</span></a><nav aria-label="Secciones administrables"><button className={activePanel === "inbox" ? "active" : ""} onClick={() => { setActivePanel("inbox"); setSelectedMessage(null); }}><span>Bandeja</span><strong>{messages.filter((item) => item.status === "new").length}</strong></button><button className={activePanel === "analytics" ? "active" : ""} onClick={() => setActivePanel("analytics")}><span>Analítica</span><strong>{analytics.views}</strong></button>{sections.map((section) => <button className={activePanel === section.type ? "active" : ""} key={section.type} onClick={() => selectSection(section.type)}><span>{section.label}</span><strong>{items.filter((item) => item.type === section.type && item.status === "published").length}</strong></button>)}</nav><div className="admin-account"><span>Sesión autorizada</span><strong>{displayName}</strong><button onClick={logout}>Cerrar sesión</button></div></aside>
    <section className="admin-workspace"><header className="admin-topbar"><div><p>MEDYNA ORGANIZATION</p><h1>{title}</h1></div>{activeSection ? <a href={activeSection.publicPath} target="_blank" rel="noreferrer">Ver página pública ↗</a> : <a href="/contact" target="_blank" rel="noreferrer">Abrir contacto ↗</a>}</header><div className="admin-status-strip"><span>{state === "loading" ? "Sincronizando" : state === "saving" || quickSaving ? "Guardando" : state === "error" ? "Requiere atención" : "Sistema disponible"}</span><p>{activePanel === "inbox" ? "Mensajes privados recibidos desde el sitio público." : "Solo los elementos publicados aparecen en el sitio público."}</p></div>
      {activePanel === "bulletin" ? <form className="quick-publisher" onSubmit={publishQuick}><div><p>PUBLICACIÓN RÁPIDA</p><h2>Comparte una actualización.</h2></div><div className="quick-fields"><input aria-label="Título opcional" placeholder="Título (opcional)" value={quickTitle} onChange={(event) => setQuickTitle(event.target.value)} maxLength={140} /><textarea aria-label="Texto de la publicación" placeholder="¿Qué quieres comunicar desde MEDYNA?" value={quickBody} onChange={(event) => setQuickBody(event.target.value)} maxLength={2000} required rows={4} /><div className="quick-actions"><select aria-label="Tipo de publicación" value={quickCategory} onChange={(event) => setQuickCategory(event.target.value)}><option>Actualización</option><option>Noticia</option><option>Informe</option></select><span>{quickBody.length}/2000</span><button disabled={quickSaving || !quickBody.trim()} type="submit">{quickSaving ? "Publicando…" : "Publicar ahora →"}</button></div>{quickNotice ? <p role="status" className="quick-notice">{quickNotice}</p> : null}</div></form> : null}
      {activePanel === "inbox" ? <div className="admin-grid inbox-grid"><section className="admin-list"><div className="admin-section-heading"><div><p>Entradas</p><h2>{messages.length ? `${messages.length} mensajes` : "Sin mensajes"}</h2></div></div>{messages.length === 0 ? <p className="admin-empty">Las solicitudes, sugerencias y mensajes aparecerán aquí.</p> : messages.map((item) => <button className={`admin-item ${item.status === "new" ? "unread" : ""}`} key={item.id} onClick={() => { setSelectedMessage(item); if (item.status === "new") void updateMessage(item, "read"); }}><span className={`admin-badge ${item.status}`}>{item.status === "new" ? "Nuevo" : item.status === "read" ? "Leído" : "Archivado"}</span><h3>{item.route}</h3><p>{item.name} · {item.contact}</p><small>{item.reference ? `${item.reference} · ` : ""}{new Date(item.createdAt).toLocaleString("es-MX")}</small></button>)}</section><section className="admin-editor inbox-detail">{selectedMessage ? <><div className="admin-section-heading"><div><p>{selectedMessage.route}</p><h2>{selectedMessage.name}</h2></div></div><dl>{selectedMessage.reference ? <div><dt>Folio</dt><dd>{selectedMessage.reference}</dd></div> : null}<div><dt>Contacto</dt><dd>{selectedMessage.contact}</dd></div>{selectedMessage.organization ? <div><dt>Organización</dt><dd>{selectedMessage.organization}</dd></div> : null}{selectedMessage.location ? <div><dt>Ubicación</dt><dd>{selectedMessage.location}</dd></div> : null}</dl><p className="inbox-message">{selectedMessage.message}</p><div className="inbox-actions"><a className="admin-primary" href={`mailto:${selectedMessage.contact}`}>Responder</a><button className="admin-secondary" onClick={() => void updateMessage(selectedMessage, selectedMessage.status === "archived" ? "read" : "archived")}>{selectedMessage.status === "archived" ? "Restaurar" : "Archivar"}</button></div></> : <p className="admin-empty">Selecciona un mensaje para leerlo y gestionarlo.</p>}</section></div> : activePanel === "analytics" ? <section className="analytics-panel"><p>Últimos 30 días. Las visitas incluyen solo navegadores que aceptaron medición. Las elecciones son conteos anónimos, no personas únicas.</p><div className="metric-grid"><article><span>Vistas con permiso</span><strong>{analytics.views}</strong></article><article><span>Sesiones estimadas</span><strong>{analytics.visitors}</strong></article><article><span>Solo necesarias</span><strong>{analytics.essentialChoices}</strong></article><article><span>Medición aceptada</span><strong>{analytics.analyticsChoices}</strong></article><article><span>Suscriptores de avisos activos</span><strong>{analytics.subscribers}</strong></article></div><div className="analytics-paths"><p>Contenido más consultado</p>{analytics.paths.length ? analytics.paths.map((item) => <div key={item.path}><span>{item.path}</span><strong>{item.views}</strong></div>) : <div><span>Sin visitas consentidas todavía.</span><strong>—</strong></div>}</div><div className="analytics-paths"><p>Temas de contacto recibidos</p>{analytics.inquiries.length ? analytics.inquiries.map((item) => <div key={item.route}><span>{item.route}</span><strong>{item.total}</strong></div>) : <div><span>Sin mensajes todavía.</span><strong>—</strong></div>}</div></section> : <div className="admin-grid"><section className="admin-list"><div className="admin-section-heading"><div><p>Contenido</p><h2>{visibleItems.length ? `${visibleItems.length} registros` : "Sin registros"}</h2></div><button onClick={() => setEditor({ ...emptyEditor, type: activePanel })}>Nuevo borrador</button></div>{state === "loading" ? <p className="admin-empty">Cargando contenido…</p> : visibleItems.length === 0 ? <p className="admin-empty">Crea el primer elemento de esta sección. Permanecerá privado hasta que lo publiques.</p> : visibleItems.map((item) => <button className="admin-item" key={item.id} onClick={() => editItem(item)}><span className={`admin-badge ${item.status}`}>{statusLabels[item.status as ContentStatus]}</span><h3>{item.title}</h3><p>{item.summary}</p><small>Actualizado {new Date(item.updatedAt).toLocaleDateString("es-MX")}</small></button>)}</section><section className="admin-editor" id="content-editor"><div className="admin-section-heading"><div><p>{editor.id ? `Registro ${editor.id}` : "Nuevo contenido"}</p><h2>Editor</h2></div></div><form onSubmit={save}><label>Sección<select value={editor.type} onChange={(event) => setEditor({ ...editor, type: event.target.value as ContentType })}>{sections.map((section) => <option key={section.type} value={section.type}>{section.label}</option>)}</select></label><label>Título<input value={editor.title} onChange={(event) => setEditor({ ...editor, title: event.target.value })} required maxLength={140} /></label><label>Resumen<textarea value={editor.summary} onChange={(event) => setEditor({ ...editor, summary: event.target.value })} required rows={3} maxLength={360} /></label><label>Contenido<textarea value={editor.body} onChange={(event) => setEditor({ ...editor, body: event.target.value })} rows={7} /></label><div className="admin-fields"><label>Ubicación o categoría<input value={editor.location} onChange={(event) => setEditor({ ...editor, location: event.target.value })} /></label><label>Fecha relevante<input type="date" value={editor.startsAt} onChange={(event) => setEditor({ ...editor, startsAt: event.target.value })} /></label></div>{editor.id ? <label>Estado<select value={editor.status} onChange={(event) => setEditor({ ...editor, status: event.target.value as ContentStatus })}><option value="draft">Borrador privado</option><option value="published">Publicado</option><option value="archived">Archivado</option></select></label> : null}{notice ? <p className={state === "error" ? "admin-notice error" : "admin-notice"}>{notice}</p> : null}<div className="admin-form-actions"><p>{editor.id ? "Guardar aplica el estado seleccionado." : "El nuevo contenido se crea como borrador privado."}</p><button className="admin-primary" disabled={state === "saving"} type="submit">{state === "saving" ? "Guardando…" : editor.id ? "Guardar cambios" : "Crear borrador"}</button></div></form></section></div>}
    </section>
  </main>;
}
