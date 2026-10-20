import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import LoginForm from "./login-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Iniciar sesión — MEDYNA", description: "Acceso administrativo de MEDYNA.", robots: { index: false, follow: false, noarchive: true } };

export default async function LoginPage() {
  if (await getAdminUser()) redirect("/admin");
  return <main className="admin-gate"><div className="admin-gate-card login-card"><Link className="admin-kicker" href="/">MEDYNA COMPANY / ACCESO PRIVADO</Link><h1>Control de<br />MEDYNA.</h1><p>Acceso reservado para administrar publicaciones, puestos y conversaciones recibidas.</p><LoginForm /></div></main>;
}
