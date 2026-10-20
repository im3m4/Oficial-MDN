"use client";
import { useState } from "react";
import type { FormEvent } from "react";

export default function LoginForm() {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setState("loading"); setMessage("");
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("email"), password: data.get("password") }) });
    const payload = await response.json() as { error?: string };
    if (!response.ok) { setState("error"); setMessage(payload.error ?? "No fue posible iniciar sesión."); return; }
    window.location.assign("/admin");
  };
  return <form className="login-form" onSubmit={submit}><label>Correo<input name="email" type="email" autoComplete="username" required /></label><label>Contraseña<input name="password" type="password" autoComplete="current-password" required /></label>{message ? <p className="login-error" role="alert">{message}</p> : null}<button className="admin-primary" disabled={state === "loading"} type="submit">{state === "loading" ? "Verificando…" : "Entrar al control"}</button></form>;
}
