"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

type Plan = "Record" | "Review" | "Audit";
const options: { name: Plan; price: string; line: string; includes: string[] }[] = [
  { name: "Record", price: "$790", line: "Una decisión, bien documentada.", includes: ["Registro de contexto, alternativas y expectativas", "Riesgos y señales que vale la pena vigilar", "Ficha de decisión lista para conservar"] },
  { name: "Review", price: "$1,790", line: "Una segunda mirada antes de avanzar.", includes: ["Todo lo incluido en Record", "Revisión independiente de supuestos y puntos ciegos", "Preguntas clave y síntesis de hallazgos"] },
  { name: "Audit", price: "$3,490", line: "Cerrar el ciclo y aprender del resultado.", includes: ["Registro y revisión inicial", "Comparación de expectativas frente a resultados aportados", "Informe de aprendizaje y próximos criterios"] },
];

export default function DecisionExperience() {
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState<Plan>("Record");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [notice, setNotice] = useState("");
  const [reference, setReference] = useState("");
  const modal = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const sending = useRef(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modal.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab" || !modal.current) return;
      const items = Array.from(modal.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href]'));
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === modal.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = before; document.removeEventListener("keydown", onKey); (previous ?? trigger.current)?.focus(); };
  }, [open]);

  const showOptions = () => { setOpen(true); setStatus("idle"); setNotice(""); };
  const requestAccess = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending.current) return;
    sending.current = true;
    const form = event.currentTarget;
    const data = new FormData(form);
    const stage = String(data.get("stage") ?? "");
    const context = String(data.get("context") ?? "").trim();
    setStatus("sending"); setNotice(""); setReference("");
    try {
      const response = await fetch("/api/contact", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        route: "Contratar a MEDYNA", name: String(data.get("name") ?? ""), contact: String(data.get("contact") ?? ""), organization: String(data.get("organization") ?? ""), website: String(data.get("website") ?? ""),
        message: `Solicitud MEDYNA state\nOpción de interés: ${plan}\nMomento de la decisión: ${stage}\nContexto: ${context}`,
      }) });
      const result = await response.json() as { error?: string; reference?: string };
      if (!response.ok || !result.reference) { setStatus("error"); setNotice(result.error ?? "No pudimos confirmar el envío. Intenta de nuevo."); return; }
      setStatus("sent"); setNotice("Recibimos tu solicitud. Conserva este folio para darle seguimiento."); setReference(result.reference); form.reset();
    } catch { setStatus("error"); setNotice("No pudimos conectar. Tus datos permanecen en el formulario para intentarlo de nuevo."); }
    finally { sending.current = false; }
  };

  return <main className="decision">
    <header className="decision-nav"><Link className="decision-brand" href="/" aria-label="MEDYNA, inicio">MEDYNA</Link><nav aria-label="Navegación de state"><a href="#entregables">Qué incluye</a><a href="#ejemplo">Ejemplo</a><a href="#preguntas">Preguntas</a></nav><button ref={trigger} className="decision-nav-action" onClick={showOptions}>Ver opciones <span aria-hidden="true">↗</span></button></header>

    <section className="state-hero" aria-labelledby="decision-title">
      <p className="decision-kicker">MEDYNA / Análisis y documentación de decisiones</p>
      <h1 id="decision-title">state</h1>
      <div className="state-hero-bottom"><div><h2>Decidir con claridad.<br />Aprender con evidencia.</h2><p>Documenta lo que esperas antes de actuar. Revisa tus supuestos y contrasta el resultado con tu punto de partida.</p><div className="state-actions"><button className="decision-primary" onClick={showOptions}>Explorar opciones <span aria-hidden="true">↗</span></button><a href="#entregables">Conocer el alcance ↓</a></div><p className="state-assurance">Solicitud sin pago inmediato · Alcance por confirmar</p></div><aside aria-label="Momentos de una decisión"><span>Tu decisión, en perspectiva.</span><ol><li><b>01</b><div>Antes de actuar<small>Contexto, alternativas y expectativas.</small></div></li><li><b>02</b><div>Al revisar<small>Supuestos, riesgos y preguntas pendientes.</small></div></li><li><b>03</b><div>Con el resultado<small>Comparación y aprendizaje.</small></div></li></ol></aside></div>
    </section>

    <section className="state-section state-deliverables" id="entregables" aria-labelledby="state-deliverables-title"><div className="state-section-heading"><p className="decision-kicker">Qué incluye</p><h2 id="state-deliverables-title">Un alcance claro.<br />Un registro que permanece.</h2><p>Elige la opción según lo que necesitas documentar o revisar. La disponibilidad y el alcance se confirman antes de cualquier pago.</p></div><div className="state-cards">{options.map(option => <article key={option.name}><span>{option.name}</span><h3>{option.line}</h3><ul>{option.includes.map(item => <li key={item}>{item}</li>)}</ul></article>)}</div><button className="state-options-link" onClick={showOptions}>Ver opciones y precios <span aria-hidden="true">↗</span></button></section>

    <section className="state-section state-example" id="ejemplo" aria-labelledby="state-example-title"><div className="state-section-heading"><p className="decision-kicker">Ejemplo ilustrativo</p><h2 id="state-example-title">La expectativa.<br />El resultado.</h2><p>Una nueva línea de servicio puede parecer una buena decisión. Dejar una referencia inicial permite revisar después qué ocurrió.</p></div><div className="state-comparison"><article><span>Antes / Expectativa</span><p>“Esperamos recibir 20 solicitudes calificadas en 90 días. El mayor riesgo es no poder responderlas a tiempo.”</p></article><article><span>Después / Resultado</span><p>“Llegaron 14 solicitudes; 11 fueron calificadas. La respuesta tardía afectó más que la demanda.”</p></article></div><p className="state-example-note">Ejemplo ficticio. Muestra una comparación; no representa un caso atendido ni una promesa de resultados.</p></section>

    <section className="state-section state-start" aria-labelledby="state-start-title"><div className="state-section-heading"><p className="decision-kicker">Para empezar</p><h2 id="state-start-title">Una decisión concreta.<br />Un primer contacto.</h2></div><div><p>Un nuevo servicio, una alianza, una expansión o un cambio operativo: cuenta qué estás considerando y en qué momento te encuentras.</p><p>Comparte un resumen breve, selecciona la opción de interés e indica cómo podemos responderte. Evita datos sensibles y documentos confidenciales en este primer contacto.</p><button className="decision-primary" onClick={showOptions}>Solicitar acceso <span aria-hidden="true">↗</span></button></div></section>

    <section className="state-section state-faq" id="preguntas" aria-labelledby="state-faq-title"><div className="state-section-heading"><p className="decision-kicker">Preguntas frecuentes</p><h2 id="state-faq-title">Antes de continuar.</h2></div><div><details><summary>¿Qué opción necesito?</summary><p>Record se centra en documentar una decisión. Review añade una revisión independiente. Audit incorpora la comparación con los resultados que aportes. Puedes consultar los alcances y precios en «Ver opciones».</p></details><details><summary>¿Se cobra al enviar la solicitud?</summary><p>No. El panel recibe una solicitud de interés. Los importes son propuestas iniciales en MXN; la disponibilidad y el alcance se confirman antes de cualquier pago.</p></details><details><summary>¿Qué confirma el folio?</summary><p>Confirma la recepción de tu solicitud. Consérvalo como referencia. No equivale a una contratación ni confirma un plazo de respuesta.</p></details><details><summary>¿Necesito enviar información confidencial?</summary><p>No en el primer contacto. Un resumen es suficiente para presentar tu interés. Consulta el <a href="/privacidad">aviso de privacidad</a> antes de enviar tus datos.</p></details></div></section>

    <section className="state-section state-close"><p className="decision-kicker">state / MEDYNA</p><h2>El siguiente paso,<br />con más claridad.</h2><button className="decision-primary" onClick={showOptions}>Ver opciones <span aria-hidden="true">↗</span></button></section>
    <footer className="decision-footer"><Link className="decision-brand" href="/">MEDYNA</Link><span>state · Análisis y documentación de decisiones</span><div><Link href="/privacidad">Privacidad</Link><Link href="/contact">Contacto</Link></div></footer>

    {open && <div className="decision-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><div className="decision-modal" role="dialog" aria-modal="true" aria-labelledby="decision-modal-title" tabIndex={-1} ref={modal}><div className="decision-modal-top"><span>MEDYNA / STATE</span><button type="button" onClick={() => setOpen(false)} aria-label="Cerrar panel">×</button></div><div className="decision-modal-intro"><p className="decision-kicker">OPCIONES DE SERVICIO</p><h2 id="decision-modal-title">Elige el nivel de claridad que necesitas.</h2><p>Un encargo concreto, con alcance visible desde el inicio. Los importes son propuestas iniciales en MXN; confirmaremos disponibilidad y alcance antes de cualquier pago.</p></div><div className="decision-options">{options.map((option) => <button type="button" className={`decision-option ${plan === option.name ? "selected" : ""}`} key={option.name} onClick={() => { setPlan(option.name); setStatus("idle"); setNotice(""); }} aria-pressed={plan === option.name}><span className="decision-option-head"><strong>{option.name}</strong><b>{option.price} <small>MXN</small></b></span><span className="decision-option-line">{option.line}</span><span className="decision-option-list">{option.includes.map(item => <span key={item}>↗ {item}</span>)}</span></button>)}</div><div className="decision-request"><div><p className="decision-kicker">SIGUIENTE PASO</p><h3>Solicitar acceso</h3><p>Envíanos lo esencial. Te responderemos con el alcance y la forma de continuar. Aquí no se realiza ningún cobro.</p></div><form onSubmit={requestAccess}><div className="decision-form-row"><label>Nombre<input name="name" autoComplete="name" minLength={2} maxLength={120} required /></label><label>Correo o teléfono<input name="contact" autoComplete="email" minLength={3} maxLength={180} required /></label></div><div className="decision-form-row"><label>Organización <small>opcional</small><input name="organization" autoComplete="organization" maxLength={180} /></label><label>Momento de la decisión<select name="stage" required defaultValue=""><option value="" disabled>Selecciona una opción</option><option>Antes de decidir</option><option>Decisión en marcha</option><option>Resultado disponible</option></select></label></div><label>¿Qué decisión quieres revisar?<textarea name="context" rows={3} minLength={10} maxLength={4500} placeholder="Un resumen breve es suficiente; evita datos sensibles en este primer contacto." required /></label><label className="decision-honeypot" aria-hidden="true">Sitio web<input name="website" tabIndex={-1} autoComplete="off" /></label>{notice && <p className={`decision-form-notice ${status}`} role="status">{notice} {reference && <strong>{reference}</strong>}</p>}<div className="decision-form-bottom"><span>Opción seleccionada: {plan}</span><button type="submit" disabled={status === "sending"}>{status === "sending" ? "Enviando…" : "Enviar solicitud"} <span aria-hidden="true">→</span></button></div><p className="decision-privacy">Usaremos estos datos para responder a tu solicitud. <Link href="/privacidad">Aviso de privacidad</Link>.</p></form></div></div></div>}
  </main>;
}
