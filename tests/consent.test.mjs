import assert from 'node:assert/strict';
import test from 'node:test';
import { allowsAnalytics, analyticsPath, cookieValue } from '../lib/consent.ts';

test('only explicit analytics choices allow visit measurement', () => {
  assert.equal(allowsAnalytics('essential'), false);
  assert.equal(allowsAnalytics(''), false);
  assert.equal(allowsAnalytics('analytics'), true);
  assert.equal(allowsAnalytics('analytics_notifications'), true);
});

test('analytics accepts only known public routes and strips neither query nor secrets', () => {
  assert.equal(analyticsPath('/research'), '/research');
  for (const path of ['/admin', '/login', '/contact?email=a@example.com', '//other.example', '/api/contact']) assert.equal(analyticsPath(path), null);
});

test('cookie parser reads exact cookie names', () => {
  assert.equal(cookieValue('medyna_consent=essential; medyna_consent_extra=analytics', 'medyna_consent'), 'essential');
  assert.equal(cookieValue(null, 'medyna_consent'), '');
});
