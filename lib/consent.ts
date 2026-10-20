export const consentCookieName = "medyna_consent";
export const analyticsSessionCookieName = "medyna_analytics_session";

export type ConsentChoice = "essential" | "analytics";

export function cookieValue(header: string | null, name: string): string {
  return header?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1) ?? "";
}

export function allowsAnalytics(consent: string): boolean {
  return consent === "analytics" || consent === "analytics_notifications";
}

const publicPaths = new Set([
  "/", "/proyectos", "/archivo", "/contact", "/opportunities", "/jobs", "/gavvel", "/aztra",
  "/bulletin", "/initiatives", "/research", "/stories", "/events", "/state", "/medyna", "/preguntas-frecuentes", "/guias/presentar-propuesta",
]);

export function analyticsPath(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 240 || !value.startsWith("/") || value.startsWith("//")) return null;
  return publicPaths.has(value) ? value : null;
}
