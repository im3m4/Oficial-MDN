"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const consentName = "medyna_consent";
function cookie(name: string): string { return document.cookie.split("; ").find((part) => part.startsWith(`${name}=`))?.split("=")[1] ?? ""; }
function applicationServerKey(value: string): Uint8Array { const normalized = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "="); return Uint8Array.from(atob(normalized), (character) => character.charCodeAt(0)); }

async function recordView() {
  await fetch("/api/analytics/view", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: window.location.pathname }) }).catch(() => undefined);
}
async function saveChoice(choice: "essential" | "analytics"): Promise<boolean> {
  try {
    const response = await fetch("/api/consent", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ choice }) });
    return response.ok;
  } catch { return false; }
}
async function disableNotifications() {
  if (!("serviceWorker" in navigator)) return;
  const registration = await navigator.serviceWorker.getRegistration("/sw.js");
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;
  await fetch("/api/notifications/unsubscribe", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: subscription.endpoint }) });
  await subscription.unsubscribe();
}
async function enableNotifications(): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return false;
  const permission = await Notification.requestPermission(); if (permission !== "granted") return false;
  const registration = await navigator.serviceWorker.register("/sw.js");
  const config = await fetch("/api/notifications/config").then((response) => response.json()) as { publicKey?: string };
  if (!config.publicKey) return false;
  const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: applicationServerKey(config.publicKey) as BufferSource });
  const response = await fetch("/api/notifications/subscribe", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(subscription) });
  return response.ok;
}

export default function ConsentManager() {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => { const consent = cookie(consentName); if (consent === "essential") void disableNotifications().catch(() => undefined); const timer = window.setTimeout(() => { if (!consent) setVisible(pathname !== "/privacidad"); }, 0); return () => window.clearTimeout(timer); }, [pathname]);
  useEffect(() => { if (cookie(consentName) === "analytics" || cookie(consentName) === "analytics_notifications") void recordView(); }, [pathname]);
  useEffect(() => {
    if (!visible) return;
    const dialog = dialogRef.current;
    dialog?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { dialog?.close(); document.body.style.overflow = previousOverflow; };
  }, [visible]);
  const essential = async () => {
    if (saving) return;
    setSaving(true); setMessage("");
    if (!(await saveChoice("essential"))) { setMessage("No se pudo guardar la preferencia. Intenta de nuevo."); setSaving(false); return; }
    try { await disableNotifications(); } catch { /* Browser permission can be managed independently. */ }
    setSaving(false); setVisible(false);
  };
  const accept = async () => {
    if (saving) return;
    setSaving(true); setMessage("");
    if (!(await saveChoice("analytics"))) { setMessage("No se pudo guardar la preferencia. Intenta de nuevo."); setSaving(false); return; }
    await recordView();
    const enabled = await enableNotifications().catch(() => false);
    setSaving(false);
    if (!enabled) setMessage("La medición está activa. Puedes permitir los avisos desde el navegador más adelante.");
    setVisible(false);
  };
  return <><footer className="privacy-footer" aria-label="Preferencias de privacidad"><button className="privacy-trigger" onClick={() => { setMessage(""); setVisible(true); }}>Privacidad y avisos</button></footer>{visible ? <dialog ref={dialogRef} className="consent-banner" aria-labelledby="consent-title" aria-describedby="consent-description" onCancel={(event) => event.preventDefault()}><div><h2 id="consent-title">Privacidad y avisos</h2><p id="consent-description">Usamos cookies necesarias. Si aceptas todas, medimos visitas para mejorar el contenido y te pediremos permiso para avisos de boletines.</p><a className="consent-details-link" href="/privacidad" target="_blank" rel="noopener noreferrer">Ver detalles de privacidad ↗</a><p className="consent-brief-note">Puedes cambiar tu elección cuando quieras.</p>{message ? <small role="status">{message}</small> : null}</div><div className="consent-actions"><button className="consent-accept" disabled={saving} onClick={() => void accept()}>Aceptar todas</button><button className="consent-essential" disabled={saving} onClick={() => void essential()}>Solo las necesarias</button></div></dialog> : null}</>;
}
