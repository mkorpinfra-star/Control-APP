import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcHoras } from '../../src/lib/jornada.js';

test('jornada comum com almoço', () => {
  assert.deepEqual(calcHoras('08:00', '17:00', '12:00', '13:00'), { normais: 8, extras: 0 });
});
test('hora extra', () => {
  assert.deepEqual(calcHoras('07:00', '19:00', '12:00', '13:00'), { normais: 8, extras: 3 });
});
test('aceita HH:MM:SS vindo do banco', () => {
  assert.deepEqual(calcHoras('08:00:00', '12:30:00'), { normais: 4.5, extras: 0 });
});
test('jornada noturna que cruza a meia-noite (antes dava 0h)', () => {
  assert.deepEqual(calcHoras('22:00', '06:00'), { normais: 8, extras: 0 });
  assert.deepEqual(calcHoras('20:00', '07:00', '23:30', '00:30'), { normais: 8, extras: 2 });
});
test('sem saída não calcula', () => {
  assert.deepEqual(calcHoras('08:00', ''), { normais: 0, extras: 0 });
});
