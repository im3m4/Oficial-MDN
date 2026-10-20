import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../dist/server/index.js';
const context = { waitUntil() {}, passThroughOnException() {} };
const runtime = { ASSETS: { fetch: async () => new Response('Not found', { status: 404 }) } };
function fetchRoute(path, options = {}) { return worker.fetch(new Request('https://xmedyna.com' + path, options), runtime, context); }

test('all administrative APIs reject anonymous requests and prevent caching of errors', async () => {
  for (const path of ['/api/admin/content', '/api/admin/messages', '/api/admin/analytics']) {
    const response = await fetchRoute(path);
    assert.equal(response.status, 401, path);
    assert.match(response.headers.get('Cache-Control'), /no-store/);
    assert.equal(response.headers.get('X-Frame-Options'), 'DENY');
  }
});

test('public mutations reject cross-origin requests before any database operation', async () => {
  for (const path of ['/api/auth/login', '/api/auth/logout', '/api/contact', '/api/consent', '/api/analytics/view', '/api/notifications/subscribe', '/api/notifications/unsubscribe']) {
    const response = await fetchRoute(path, { method: 'POST', body: '{}', headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' } });
    assert.equal(response.status, 403, path);
  }
});

test('login and contact reject oversized requests and malformed JSON before processing', async () => {
  for (const path of ['/api/auth/login', '/api/contact']) {
    const headers = { Origin: 'https://xmedyna.com', 'Content-Type': 'application/json' };
    assert.equal((await fetchRoute(path, { method: 'POST', headers, body: 'x'.repeat(9000) })).status, 413);
    assert.equal((await fetchRoute(path, { method: 'POST', headers, body: '{' })).status, 400);
  }
});
