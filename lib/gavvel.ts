export const gavvelRoutes = ["AZTRA / presentar objetivo", "AZTRA / colaboración", "GAVVEL / presentar objetivo", "GAVVEL / colaboración"] as const;
export type GavvelRoute = typeof gavvelRoutes[number];

export function isGavvelRoute(route: string): route is GavvelRoute {
  return gavvelRoutes.some((value) => value === route);
}

export function gavvelMessage(payload: Record<string, unknown>): string {
  const field = (key: string, label: string, min: number, max: number) => {
    const value = typeof payload[key] === "string" ? payload[key].trim() : "";
    if (value.length < min || value.length > max) throw new Error(`Revisa el campo «${label}».`);
    return value || "No indicado";
  };
  const focus = field("focus", "Tipo de objetivo", 1, 60);
  if (!["Expansión empresarial", "Lanzamiento de proyecto", "Colaboración"].includes(focus)) throw new Error("Selecciona un tipo de objetivo válido.");
  return [
    "AZTRA — Convocatoria inicial",
    `Tipo: ${focus}`,
    `Objetivo:\n${field("goal", "Objetivo", 20, 1000)}`,
    `Punto de partida:\n${field("context", "Punto de partida", 0, 1000)}`,
    `Plazo: ${field("horizon", "Plazo", 0, 120)}`,
    `Recursos y capacidades:\n${field("resources", "Recursos y capacidades", 0, 700)}`,
    `Restricciones:\n${field("constraints", "Restricciones", 0, 700)}`,
  ].join("\n\n");
}
