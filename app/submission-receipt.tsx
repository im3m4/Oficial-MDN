"use client";

import { useState } from "react";

export default function SubmissionReceipt({ reference, message, onAnother }: { reference: string; message: string; onAnother: () => void }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const copy = async () => {
    try { await navigator.clipboard.writeText(reference); setCopyState("copied"); }
    catch { setCopyState("error"); }
  };
  return <div className="intake-receipt" role="status"><p className="intake-receipt-label">Recepción confirmada</p><h3>Propuesta recibida.</h3><p>{message}</p><strong className="contact-receipt">{reference}</strong><div className="intake-receipt-actions"><button type="button" onClick={() => void copy()}>{copyState === "copied" ? "Folio copiado" : "Copiar folio"}</button><button type="button" onClick={onAnother}>Enviar otra propuesta</button></div>{copyState === "error" ? <p>Puedes seleccionar y copiar el folio directamente.</p> : null}</div>;
}
