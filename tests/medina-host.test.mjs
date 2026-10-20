import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import worker from "../dist/server/index.js";

test("biography is rendered at its subdomain and its main-domain fallback", async () => {
  const document = await readFile(new URL("../public/medina-document.txt", import.meta.url), "utf8");
  for (const url of ["https://medina.xmedyna.com/?utm_source=instagram", "https://xmedyna.com/medina"]) {
    let requestedPath;
    const response = await worker.fetch(new Request(url), {
      ASSETS: { fetch: async (request) => {
        requestedPath = new URL(request.url).pathname;
        return new Response(document, { headers: { "Content-Type": "text/plain" } });
      } },
    }, { waitUntil() {}, passThroughOnException() {} });
    assert.equal(requestedPath, "/medina-document.txt");
    assert.equal(response.status, 200);
    assert.match(response.headers.get("Content-Type"), /^text\/html/);
    const html = await response.text();
    assert.match(html, /<title>Emanuel Medina — CEO de MEDYNA/);
    assert.match(html, /rel="canonical" href="https:\/\/xmedyna.com\/medina/);
    assert.match(html, /https:\/\/xmedyna.com\/contact/);
  }
});
