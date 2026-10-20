import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the current MEDYNA homepage and highlights AZTRA", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Medyna<\/title>/i);
  assert.match(html, /rel="canonical" href="https:\/\/xmedyna\.com\/?"/i);
  assert.match(html, /Proyecto destacado \/ MEDYNA/);
  assert.match(html, /href="\/aztra"/);
  assert.match(html, /Convocatoria inicial abierta/);
  assert.match(html, /Servicio en preparación/);
  assert.match(html, /href="\/contact"/);
  assert.match(html, /href="\/opportunities"/);
  assert.match(html, /href="\/initiatives"/);
  assert.match(html, /href="\/research"/);
  assert.match(html, /href="\/archivo"/);
  assert.match(html, /href="\/login"/);
  assert.doesNotMatch(html, /Sin convocatorias públicas activas/);
  assert.doesNotMatch(html, /Contratar a MEDYNA/);
  assert.doesNotMatch(html, /codex-preview|Building your site|#arquitectura|#alcance|#principios|#alianzas/i);
});

test("ships the optimized visual assets", async () => {
  await Promise.all([
    access(new URL("../public/medyna-hero-dark.webp", import.meta.url)),
    access(new URL("../public/medyna-human-connection.webp", import.meta.url)),
    access(new URL("../public/medyna-hidden-sigil.webp", import.meta.url)),
    access(new URL("../public/og-connect.png", import.meta.url)),
  ]);
});

test("keeps same-page navigation clean and links to real subpages", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /href=["']#(?:arquitectura|alcance|principios|alianzas)/i);
  assert.match(source, /href="\/contact"/);
  assert.match(source, /href="\/opportunities"/);
});

test("preserves the existing institutional contact routes and private receipt", async () => {
  const [source, styles] = await Promise.all([
    readFile(new URL("../app/contact/contact-portal.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(source, /Trabajar con nosotros/);
  assert.match(source, /Proponer una alianza/);
  assert.match(source, /Presentar una idea/);
  assert.match(source, /Ofrecer servicios/);
  assert.match(source, /Oportunidad de negocio/);
  assert.match(source, /Compartir información/);
  assert.match(source, /Creadores y talento/);
  assert.match(source, /Prensa y medios/);
  assert.match(source, /setSelectedRoute\(route\)/);
  assert.match(source, /fetch\("\/api\/contact"/);
  assert.match(source, /control administrativo/);
  assert.match(source, /payload\.reference/);
  assert.match(styles, /\.entry-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3, 1fr\)/s);
});

test("serves /contact with its own visible content and social metadata", async () => {
  const response = await render("/contact");
  assert.equal(response.status, 200);
  const html = await response.text();

  assert.match(html, /<title>Contacto — MEDYNA<\/title>/i);
  assert.match(html, /rel="canonical" href="https:\/\/xmedyna\.com\/contact"/i);
  assert.match(html, /Una buena propuesta/);
  assert.match(html, /Contratar a MEDYNA/);
  assert.match(html, /Cuéntanos/);
  assert.doesNotMatch(html, /og-connect\.png/);
});

test("AZTRA renders its real intake, development state and share metadata", async () => {
  const response = await render("/aztra");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /rel="canonical" href="https:\/\/xmedyna\.com\/aztra"/);
  assert.match(html, /aztra-social\.png/);
  assert.match(html, /Servicio en preparación/);
  assert.match(html, /Enviar propuesta/);
  assert.match(html, /<details class="intake-details"><summary>Añadir contexto/);
  for (const field of ["name", "contact", "focus", "goal", "context", "horizon", "resources", "constraints"]) assert.ok(html.includes(`name="${field}"`));
  assert.doesNotMatch(html, /Autorizaciones Globales|certificado por la ONU|acceso garantizado/i);
});

test('contact keeps optional details collapsed and privacy preferences in the page footer', async () => {
  const response = await render('/contact');
  const html = await response.text();
  assert.match(html, /<details class="intake-details"><summary>Añadir detalles/);
  assert.match(html, /<footer class="privacy-footer" aria-label="Preferencias de privacidad"><button class="privacy-trigger"/);
  assert.match(html, /Enviar mensaje/);
});

test("connects /opportunities to approved persistent publications", async () => {
  const [page, content, hosting] = await Promise.all([
    readFile(new URL("../app/opportunities/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/content.ts", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
  ]);
  assert.match(page, /listPublishedContent\("opportunity"\)/);
  assert.match(page, /Sin convocatorias públicas activas/);
  assert.match(content, /status, "published"/);
  assert.equal(JSON.parse(hosting).d1, "DB");
});

test("keeps every administrative operation authenticated and auditable", async () => {
  const [page, route, auth, schema, login] = await Promise.all([
    readFile(new URL("../app/admin/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/content/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/admin-auth.ts", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/auth/login/route.ts", import.meta.url), "utf8"),
  ]);
  assert.match(page, /robots: \{ index: false, follow: false, noarchive: true \}/);
  assert.match(route, /requireApiAdmin\(\)/);
  assert.match(route, /isSameOrigin\(request\)/);
  assert.match(route, /contentAudit/);
  assert.match(auth, /MEDYNA_ADMIN_PASSWORD/);
  assert.match(auth, /httpOnly: true/);
  assert.match(login, /verifyAdminCredentials/);
  assert.doesNotMatch(auth + login, /12331312/);
  assert.match(schema, /idx_content_items_type_status/);
  assert.match(schema, /idx_content_audit_item/);
  assert.match(schema, /contactSubmissions/);
  assert.match(schema, /pushSubscriptions/);
});


test("the original project URL keeps working after the AZTRA rename", async () => {
  const response = await render("/gavvel");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<h1[^>]*>AZTRA<\/h1>/);
  assert.match(html, /rel="canonical" href="https:\/\/xmedyna\.com\/aztra"/);
});
