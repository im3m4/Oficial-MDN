import { indexablePaths, siteOrigin } from "@/lib/public-discovery";
export function GET() {
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + indexablePaths.map(path => `<url><loc>${siteOrigin}${path === "/" ? "/" : path}</loc></url>`).join("") + '</urlset>';
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
