import PublicCollection from "@/app/public-collection";

export const metadata = {
  title: "Noticias e informes — MEDYNA",
  description: "Notas, anuncios e informes publicados directamente por MEDYNA.",
  alternates: { canonical: "/bulletin" },
};

export default function BulletinPage() {
  return (
    <PublicCollection
      type="bulletin"
      eyebrow="Boletín / Archivo público"
      title="La voz de MEDYNA."
      description="Notas, anuncios e informes emitidos directamente por el grupo. Cada publicación lleva una fecha, un contexto y una responsabilidad editorial."
      empty="El archivo espera su primera publicación."
    />
  );
}
