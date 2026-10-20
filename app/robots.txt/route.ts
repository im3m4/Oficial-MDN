export function GET() {
  return new Response("User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin\nDisallow: /login\n\nSitemap: https://xmedyna.com/sitemap.xml\n", { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
