import type { Metadata } from "next";
import ConsentManager from "./consent-manager";
import "./globals.css";

const title = "Medyna";
const description = "Grupo privado dedicado a desarrollar empresas, conocimiento y proyectos con criterio independiente y horizonte de largo plazo.";

export async function generateMetadata(): Promise<Metadata> {
  const image = "https://xmedyna.com/medyna-hero-monochrome.webp";

  return {
    metadataBase: new URL("https://xmedyna.com"),
    title,
    description,
    alternates: { canonical: "/" },
    applicationName: "Medyna",
    manifest: "/manifest.webmanifest",
    appleWebApp: { capable: true, title: "Medyna", statusBarStyle: "black-translucent" },
    category: "technology",
    openGraph: { title, description, url: "https://xmedyna.com/", siteName: "Medyna", locale: "es_MX", type: "website", images: [{ url: image, width: 1672, height: 941, alt: "MEDYNA — Una visión propia." }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}<ConsentManager /></body></html>;
}
