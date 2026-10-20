"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import SubmissionReceipt from "../submission-receipt";

type EntryRoute = "Contratar a MEDYNA" | "Trabajar con nosotros" | "Proponer una alianza" | "Presentar una idea" | "Ofrecer servicios" | "Oportunidad de negocio" | "Compartir información" | "Creadores y talento" | "Prensa y medios" | "Sugerencia general";

const entryways: Array<{ number: string; title: EntryRoute; text: string; action: string }> = [
  { number: "01", title: "Contratar a MEDYNA", text: "Presenta un encargo, su contexto y el resultado que buscas.", action: "Presentar encargo" },
  { number: "02", title: "Trabajar con nosotros", text: "Comparte tu trayectoria y la capacidad que deseas aportar.", action: "Presentar perfil" },
  { number: "03", title: "Proponer una alianza", text: "Plantea una colaboración entre organizaciones con intereses concretos.", action: "Plantear alianza" },
  { number: "04", title: "Presentar una idea", text: "Expón una tesis, un proyecto o una iniciativa con dirección propia.", action: "Presentar idea" },
  { number: "05", title: "Ofrecer servicios", text: "Presenta una especialidad, un equipo o una capacidad de ejecución.", action: "Ofrecer capacidad" },
  { number: "06", title: "Oportunidad de negocio", text: "Comparte una oportunidad comercial o estratégica con términos claros.", action: "Abrir conversación" },
  { number: "07", title: "Compartir información", text: "Aporta información pertinente que puedas compartir de forma legítima.", action: "Compartir información" },
  { number: "08", title: "Creadores y talento", text: "Presenta una obra, un portafolio o una voz creativa singular.", action: "Presentar portafolio" },
  { number: "09", title: "Prensa y medios", text: "Solicita información institucional o plantea una conversación editorial.", action: "Escribir a MEDYNA" },
  { number: "10", title: "Sugerencia general", text: "Comparte una observación que debamos escuchar.", action: "Enviar nota" },
];

export default function ContactPortal() {
  const [selectedRoute, setSelectedRoute] = useState<EntryRoute>("Contratar a MEDYNA");
  const [formState, setFormState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [notice, setNotice] = useState("");
  const [receipt, setReceipt] = useState("");
  const sending = useRef(false);
  const result = useRef<HTMLDivElement>(null);

  const openRoute = (route: EntryRoute) => {
    if (sending.current) return;
    setSelectedRoute(route);
    if (formState === "sent") { setFormState("idle"); setReceipt(""); }
    setNotice("");
    window.requestAnimationFrame(() => document.getElementById("proposal")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const sendContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending.current) return;
    const data = new FormData(event.currentTarget);
    sending.current = true; setFormState("sending"); setNotice("");
    try {
      const response = await fetch("/api/contact", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(data.entries())) });
      const payload = await response.json() as { error?: string; reference?: string };
      if (!response.ok || !payload.reference) { setFormState("error"); setNotice(payload.error ?? "No fue posible confirmar el envío. Tus datos siguen aquí para reintentar."); return; }
      setReceipt(payload.reference); setFormState("sent");
    } catch {
      setFormState("error"); setNotice("No fue posible conectar. Tu mensaje sigue aquí; puedes volver a intentarlo.");
    } finally { sending.current = false; window.requestAnimationFrame(() => result.current?.focus()); }
  };

  return (
    <>
      <section className="contact-entries" id="entries" aria-labelledby="entries-title">
        <p className="section-label">Áreas de correspondencia</p>
        <h2 id="entries-title">Elige la naturaleza<br />de tu propuesta.</h2>
        <div className="entry-grid">
          {entryways.map((entry) => (
            <article className="entry-card" key={entry.number}>
              <span>{entry.number}</span><h3>{entry.title}</h3><p>{entry.text}</p>
              <button type="button" onClick={() => openRoute(entry.title)}>{entry.action} <span aria-hidden="true">↗</span></button>
            </article>
          ))}
        </div>
      </section>
      <section className="intake-panel" id="proposal" aria-labelledby="proposal-title">
        <div className="intake-inner">
          <div className="intake-heading"><p className="section-label">Contacto / MEDYNA</p><h2 id="proposal-title">Hablemos.</h2><p>Una idea, una propuesta o una pregunta. Empieza por ahí.</p></div>
          {formState === "sent" ? <div ref={result} tabIndex={-1}><SubmissionReceipt reference={receipt} message="Tu mensaje quedó registrado en el control administrativo de MEDYNA. Conserva el folio para futuras consultas." onAnother={() => { setFormState("idle"); setReceipt(""); }} /></div> :
            <form className="intake-form" onSubmit={sendContact} aria-busy={formState === "sending"}>
              <fieldset disabled={formState === "sending"}>
                <legend className="gavvel-sr-only">Propuesta a MEDYNA</legend>
                <label className="intake-topic">Motivo de contacto<select name="route" value={selectedRoute} onChange={(event) => setSelectedRoute(event.target.value as EntryRoute)} required>{entryways.map((entry) => <option key={entry.title}>{entry.title}</option>)}</select></label>
                <label>Tu mensaje<textarea name="message" rows={3} required minLength={10} maxLength={5000} placeholder="Qué tienes en mente y cómo podemos ayudarte." /></label>
                <div className="intake-pair"><label>Tu nombre<input name="name" autoComplete="name" required minLength={2} maxLength={120} placeholder="Cómo te llamas" /></label><label>Correo o teléfono<input name="contact" autoComplete="email" required minLength={3} maxLength={180} placeholder="Dónde podemos responderte" /></label></div>
                <details className="intake-details"><summary>Añadir detalles <span>Opcional</span></summary><div className="intake-extra intake-pair"><label>Organización<input name="organization" autoComplete="organization" maxLength={180} /></label><label>Ubicación o mercado<input name="location" maxLength={180} /></label></div></details>
                <label className="form-honeypot" aria-hidden="true">Sitio web<input name="website" tabIndex={-1} autoComplete="off" /></label>
                <div className="intake-submit"><p>Tu mensaje se recibe de forma privada.<br /><Link href="/privacidad">Privacidad y avisos</Link></p><button type="submit">{formState === "sending" ? "Enviando…" : "Enviar mensaje"}<span aria-hidden="true">↗</span></button></div>
              </fieldset>
              {notice ? <div className="contact-notice error" ref={result} role="status" tabIndex={-1}>{notice}</div> : null}
            </form>}
        </div>
      </section>
    </>
  );
}
