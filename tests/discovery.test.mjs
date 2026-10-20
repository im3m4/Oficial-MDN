import assert from "node:assert/strict";
import test from "node:test";
import worker from "../dist/server/index.js";
const render = (path) => worker.fetch(new Request(`https://xmedyna.com${path}`, {headers:{accept:"text/html"}}), { ASSETS: {fetch:async()=>new Response("Not found",{status:404})}}, { waitUntil() {}, passThroughOnException() {} });

test("new public pages render their own content, metadata, breadcrumbs and useful destinations", async () => {
 for(const [path,title] of [["/medyna","Qué es MEDYNA"],["/preguntas-frecuentes","Preguntas frecuentes"],["/guias/presentar-propuesta","Cómo presentar una propuesta a AZTRA"]]) {
  const response=await render(path); assert.equal(response.status,200);
  const html=await response.text();
  assert.ok(html.includes(title));
  assert.ok(html.includes(`rel="canonical" href="https://xmedyna.com${path}"`));
  assert.match(html,/BreadcrumbList/); assert.match(html,/href="\/contact"/);
  assert.match(html,/href="\/aztra(?:#presentar)?"/);
  assert.match(html,/<h1[^>]*>/); assert.match(html,/name="description"/);
 }
 const guide=await(await render('/guias/presentar-propuesta')).text();
 assert.match(guide,/Ejemplo ilustrativo/); assert.match(guide,/no garantiza selección/);
});

test("sitemap lists canonical public pages and excludes private access and legacy duplication", async()=>{
 const response=await render('/sitemap.xml'); assert.equal(response.status,200);
 assert.match(response.headers.get('content-type'),/application\/xml/);
 const xml=await response.text();
 for(const path of ['/medyna','/preguntas-frecuentes','/guias/presentar-propuesta','/aztra','/medina']) assert.ok(xml.includes(`<loc>https://xmedyna.com${path}</loc>`));
 assert.doesNotMatch(xml,/\/admin|\/login|\/api\/|\/gavvel|medina\.xmedyna/);
 const robots=await(await render('/robots.txt')).text();
 assert.match(robots,/Sitemap: https:\/\/xmedyna.com\/sitemap.xml/);
 assert.match(robots,/Disallow: \/api\//);
});
