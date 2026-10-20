import assert from 'node:assert/strict';
import test from 'node:test';
import { gavvelMessage, isGavvelRoute } from '../lib/gavvel.ts';
import { analyticsPath } from '../lib/consent.ts';

const submission = {
  focus: 'Expansión empresarial',
  goal: 'Abrir operaciones en un segundo mercado durante el próximo año.',
  context: 'Contamos con un proyecto validado y necesitamos evaluar nuestra siguiente etapa.',
  horizon: '12 meses',
  resources: 'Equipo de tres personas.',
  constraints: 'Presupuesto limitado.',
};

test('preserves the full strategic brief for private review', () => {
  const message = gavvelMessage(submission);
  for (const value of Object.values(submission)) assert.ok(message.includes(value));
  assert.ok(isGavvelRoute('GAVVEL / presentar objetivo'));
  assert.ok(isGavvelRoute('GAVVEL / colaboración'));
  assert.ok(isGavvelRoute('AZTRA / presentar objetivo'));
  assert.ok(isGavvelRoute('AZTRA / colaboración'));
  assert.equal(isGavvelRoute('AZTRA / aprobado'), false);
  assert.equal(isGavvelRoute('GAVVEL / aprobado'), false);
});

test('rejects incomplete or oversized objectives and unsupported categories', () => {
  for (const patch of [{goal: ''}, {goal: 'x'.repeat(1001)}, {context: 'x'.repeat(1001)}, {horizon: 'x'.repeat(121)}, {resources: 'x'.repeat(701)}, {focus: 'Autorizado globalmente'}]) {
    assert.throws(() => gavvelMessage({...submission, ...patch}));
  }
});

test('a brief objective can be sent without optional context or deadline', () => {
  const message = gavvelMessage({focus: submission.focus, goal: submission.goal});
  assert.ok(message.includes(submission.goal));
  assert.ok(message.includes('Punto de partida:\nNo indicado'));
  assert.ok(message.includes('Plazo: No indicado'));
});

test('accepts collaboration and optional fields without inventing resources', () => {
  const message = gavvelMessage({...submission, focus: 'Colaboración', resources: '', constraints: ''});
  assert.ok(message.includes('Tipo: Colaboración'));
  assert.ok(message.includes('Recursos y capacidades:\nNo indicado'));
});

test('permits consented GAVVEL page analytics but never its private data or query strings', () => {
  assert.equal(analyticsPath('/gavvel'), '/gavvel');
  assert.equal(analyticsPath('/aztra'), '/aztra');
  assert.equal(analyticsPath('/aztra?goal=private'), null);
  assert.equal(analyticsPath('/gavvel?goal=private'), null);
  assert.equal(analyticsPath('/api/contact'), null);
});
