import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import { secureResponse } from '../worker/security.mjs';
import { isAllowedPushEndpoint, isValidPushKeys } from '../lib/push-security.mjs';

async function loadModule(path, prelude) {
  const source = (await readFile(new URL(path, import.meta.url), 'utf8')).replace(/^import .*;\n/gm, '');
  const { outputText } = ts.transpileModule(prelude + '\n' + source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } });
  return import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));
}

test('rejects SSRF targets, credentials, deceptive suffixes and nonstandard ports', () => {
  for (const endpoint of ['https://127.0.0.1/', 'https://[::1]/', 'https://169.254.169.254/', 'https://internal.example/', 'https://fcm.googleapis.com.evil.example/', 'https://fcm.googleapis.com@evil.example/', 'https://u:p@fcm.googleapis.com/', 'http://fcm.googleapis.com/', 'https://fcm.googleapis.com:8443/', 'https://fcm.googleapis.com/#fragment', 'garbage']) assert.equal(isAllowedPushEndpoint(endpoint), false, endpoint);
  for (const endpoint of ['https://fcm.googleapis.com/fcm/send/token', 'https://updates.push.services.mozilla.com/wpush/v2/token', 'https://web.push.apple.com/token', 'https://wns2.notify.windows.com/token']) assert.equal(isAllowedPushEndpoint(endpoint), true, endpoint);
});

test('rejects malformed push keys', () => {
  const key = Buffer.from([4, ...new Array(64).fill(1)]).toString('base64url');
  const auth = Buffer.alloc(16, 1).toString('base64url');
  assert.equal(isValidPushKeys(key, auth), true);
  assert.equal(isValidPushKeys('garbage', auth), false);
  assert.equal(isValidPushKeys(key, '%%%'), false);
  assert.equal(isValidPushKeys(Buffer.alloc(65).toString('base64url'), auth), false);
});

test('protects pages and private API errors while preserving responses', async () => {
  for (const path of ['/', '/medina', '/_vinext/image', '/api/admin/content', '/login', '/admin']) {
    const response = secureResponse(new Response('content', { status: 403, headers: { 'Content-Type': 'text/plain', 'Set-Cookie': 'example=1; Secure' } }), new URL('https://xmedyna.com' + path));
    assert.equal(response.status, 403);
    assert.equal(await response.text(), 'content');
    assert.equal(response.headers.get('Set-Cookie'), 'example=1; Secure');
    assert.equal(response.headers.get('X-Frame-Options'), 'DENY');
    assert.match(response.headers.get('Content-Security-Policy'), /frame-ancestors 'none'/);
    assert.match(response.headers.get('Content-Security-Policy'), /object-src 'none'/);
    if (path.startsWith('/api/') || path === '/admin' || path === '/login') assert.match(response.headers.get('Cache-Control'), /no-store/);
  }
});

test('bounded parser rejects oversized streamed and declared payloads and invalid JSON', async () => {
  const { readJsonBounded, isSameOrigin } = await loadModule('../lib/request-security.ts', 'const env = {};');
  const request = body => new Request('https://xmedyna.com/api/test', { method: 'POST', body });
  assert.deepEqual(await readJsonBounded(request('{"ok":true}'), 20), { ok: true });
  for (const body of ['x'.repeat(21), '[]', 'null', '{']) await assert.rejects(readJsonBounded(request(body), 20));
  await assert.rejects(readJsonBounded(new Request('https://xmedyna.com/api/test', { method: 'POST', body: '{}', headers: { 'Content-Length': '21' } }), 20), error => error.status === 413);
  assert.equal(isSameOrigin(new Request('https://xmedyna.com', { headers: { Origin: 'https://evil.example' } })), false);
  assert.equal(isSameOrigin(new Request('https://xmedyna.com')), false);
  assert.equal(isSameOrigin(new Request('https://xmedyna.com', { headers: { Origin: 'https://xmedyna.com' } })), true);
});

test('signed sessions reject forgery, invalid expiration and missing secrets; cookies are host-bound', async () => {
  const auth = await loadModule('../lib/admin-auth.ts', `
    const env = {};
    let token;
    export function configure(values) { Object.assign(env, values); }
    export function setToken(value) { token = value; }
    export let lastCookie;
    async function cookies() { return { get: () => ({ value: token }), set: (...args) => { lastCookie = args; } }; }
  `);
  auth.configure({ MEDYNA_SESSION_SECRET: 'test-only-session-secret', MEDYNA_ADMIN_EMAIL: 'admin@example.test', MEDYNA_ADMIN_PASSWORD: 'test-only-password' });
  assert.equal(await auth.verifyAdminCredentials('admin@example.test', 'wrong'), false);
  assert.equal(await auth.verifyAdminCredentials('admin@example.test', 'test-only-password'), true);
  const token = await auth.createAdminSession('admin@example.test');
  auth.setToken(token);
  assert.equal((await auth.getAdminUser()).email, 'admin@example.test');
  auth.setToken(token + 'forged');
  assert.equal(await auth.getAdminUser(), null);
  async function signed(payload) {
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode('test-only-session-secret'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    return encoded + '.' + Buffer.from(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(encoded))).toString('base64url');
  }
  for (const exp of ['tomorrow', '999999999999999999', Date.now() - 1, Date.now() + 86400000, null]) {
    auth.setToken(await signed({ sub: 'medyna-admin', email: 'admin@example.test', exp }));
    assert.equal(await auth.getAdminUser(), null);
  }
  await auth.setAdminSession('admin@example.test');
  assert.equal(auth.lastCookie[0], '__Host-medyna_admin_session');
  assert.deepEqual(auth.lastCookie[2], { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 43200 });
  auth.configure({ MEDYNA_SESSION_SECRET: '' });
  auth.setToken(token);
  assert.equal(await auth.getAdminUser(), null);
});
