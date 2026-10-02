// Regressão do bug de fuso: rodar com TZ=America/Sao_Paulo
//   TZ=America/Sao_Paulo node --test tests/unit/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dataISO, addDias, segundaDaSemana, horaAgoraHHMM } from '../../src/lib/datas.js';

const noite = new Date(2026, 9, 2, 22, 30); // sexta 02/10/2026 22:30 no horário local

test('ambiente de teste está em UTC-3', () => {
  assert.equal(noite.getTimezoneOffset(), 180, 'rode com TZ=America/Sao_Paulo');
});

test('jeito antigo (toISOString) erra a data após as 21h — evidência do bug', () => {
  assert.equal(noite.toISOString().split('T')[0], '2026-10-03');
});

test('dataISO usa a data local', () => {
  assert.equal(dataISO(noite), '2026-10-02');
});

test('segunda da semana à noite continua na semana certa', () => {
  assert.equal(segundaDaSemana(noite), '2026-09-28');
  assert.equal(segundaDaSemana(new Date(2026, 8, 28, 23, 59)), '2026-09-28'); // segunda 23:59
  assert.equal(segundaDaSemana(new Date(2026, 9, 4, 22, 0)), '2026-09-28'); // domingo 22h
  assert.equal(segundaDaSemana('2026-10-04'), '2026-09-28');
});

test('addDias atravessa mês/ano', () => {
  assert.equal(addDias('2026-12-31', 1), '2027-01-01');
  assert.equal(addDias('2026-03-01', -1), '2026-02-28');
});

test('hora local HH:MM', () => {
  assert.equal(horaAgoraHHMM(noite), '22:30');
});
