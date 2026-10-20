import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import AdminConsole from "./admin-console";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Control de MEDYNA Organization",
  description: "Acceso privado para administrar publicaciones institucionales de MEDYNA Organization.",
  alternates: { canonical: "https://xmedyna.com/admin" },
  robots: { index: false, follow: false, noarchive: true },
  openGraph: { title: "Control de MEDYNA Organization", description: "Acceso privado para administrar publicaciones institucionales de MEDYNA Organization.", url: "https://xmedyna.com/admin", images: [] },
  twitter: { title: "Control de MEDYNA Organization", description: "Acceso privado para administrar publicaciones institucionales de MEDYNA Organization.", images: [] },
};

export default async function AdminPage() {
  const user = await getAdminUser();
  if (!user) redirect("/login");
  return <AdminConsole displayName={user.displayName} />;
}
