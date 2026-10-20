"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import SubmissionReceipt from "../submission-receipt";

export default function GavvelIntake() {
  const [focus, setFocus] = useState("Expansión empresarial");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [notice, setNotice] = useState("");
  const [receipt, setReceipt] = useState("");
  const sending = useRef(false);
  const result = useRef<HTMLDivElement>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending.current) return;
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    sending.current = true; setState("sending"); setNotice("");
    try {
      const response = await fetch("/api/contact", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, route: focus === "Colaboración" ? "AZTRA / colaboración" : "AZTRA / presentar objetivo" }) });
      const payload = await response.json() as { error?: string; reference?: string };
      if (!response.ok || !payload.reference) { setState("error"); setNotice(payload.error ?? "No fue posible confirmar la recepción. Tus datos siguen aquí para reintentar."); return; }
      setReceipt(payload.reference); setState("sent");
    } catch { setState("error"); setNotice("No fue posible conectar. Tus datos siguen aquí; puedes volver a intentarlo."); }
    finally { sending.current = false; window.requestAnimationFrame(() => result.current?.focus()); }
  };

  return (
    <section className="intake-panel" id="presentar" aria-labelledby="gavvel-form-title">
      <div className="intake-inner">
        <div className="intake-heading"><p className="section-label">Presentar a AZTRA</p><h2 id="gavvel-form-title">¿Qué quieres lograr?</h2><p>Cuéntanos lo esencial. El resto puede esperar.</p></div>
        {state === "sent" ? <div ref={result} tabIndex={-1}><SubmissionReceipt reference={receipt} message="Guardamos tu propuesta de forma privada. Conserva el folio; la recepción no confirma selección ni un plazo de respuesta." onAnother={() => { setState("idle"); setReceipt(""); setFocus("Expansión empresarial"); }} /></div> :
          <form className="intake-form" onSubmit={submit} aria-busy={state === "sending"}>
            <fieldset disabled={state === "sending"}>
              <legend className="gavvel-sr-only">Propuesta a AZTRA</legend>
              <label className="intake-topic">Tema<select name="focus" value={focus} onChange={(event) => setFocus(event.target.value)} required><option>Expansión empresarial</option><option>Lanzamiento de proyecto</option><option>Colaboración</option></select></label>
              <label>{focus === "Colaboración" ? "Tu colaboración" : "Tu objetivo"}<textarea name="goal" rows={3} required minLength={20} maxLength={1000} placeholder="Qué quieres conseguir y qué te gustaría resolver con AZTRA." /></label>
              <div className="intake-pair"><label>Tu nombre<input name="name" autoComplete="name" required minLength={2} maxLength={120} placeholder="Cómo te llamas" /></label><label>Correo o teléfono<input name="contact" autoComplete="email" required minLength={3} maxLength={180} placeholder="Dónde podemos responderte" /></label></div>
              <details className="intake-details"><summary>Añadir contexto <span>Opcional</span></summary><div className="intake-extra">
                <div className="intake-pair"><label>Organización<input name="organization" autoComplete="organization" maxLength={180} /></label><label>Mercado o ubicación<input name="location" maxLength={180} /></label></div>
                <label>Punto de partida<textarea name="context" rows={2} maxLength={1000} placeholder="Qué existe hoy y qué falta resolver." /></label>
                <label>Plazo<input name="horizon" maxLength={120} placeholder="Si ya tienes uno en mente." /></label>
                <div className="intake-pair"><label>Recursos y capacidades<textarea name="resources" rows={2} maxLength={700} /></label><label>Restricciones<textarea name="constraints" rows={2} maxLength={700} /></label></div>
              </div></details>
              <label className="form-honeypot" aria-hidden="true">Sitio web<input name="website" tabIndex={-1} autoComplete="off" /></label>
              <div className="intake-submit"><p>Recepción privada. Sin documentos confidenciales.<br /><Link href="/privacidad">Privacidad y avisos</Link></p><button type="submit">{state === "sending" ? "Enviando…" : "Enviar propuesta"}<span aria-hidden="true">↗</span></button></div>
            </fieldset>
            {notice ? <div className="contact-notice error" role="status" ref={result} tabIndex={-1}>{notice}</div> : null}
          </form>}
      </div>
    </section>
  );
}
