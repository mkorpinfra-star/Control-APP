// Datas no fuso LOCAL do aparelho (YYYY-MM-DD).
// Não use `new Date().toISOString().split('T')[0]`: isso devolve a data em UTC e,
// no Brasil (UTC-3), a partir das 21h o "hoje" vira o dia seguinte.

const pad = (n) => String(n).padStart(2, '0');

export function dataISO(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function hojeISO() {
  return dataISO(new Date());
}

// Converte 'YYYY-MM-DD' em Date ao meio-dia local (evita pular de dia em horário de verão/UTC)
export function parseISOData(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

export function addDias(str, n) {
  const dt = parseISOData(str);
  dt.setDate(dt.getDate() + n);
  return dataISO(dt);
}

// Segunda-feira da semana da data informada (Date ou 'YYYY-MM-DD')
export function segundaDaSemana(data) {
  const d = typeof data === 'string' ? parseISOData(data) : new Date(data.getFullYear(), data.getMonth(), data.getDate(), 12);
  const dow = d.getDay();
  d.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow));
  return dataISO(d);
}

export function horaAgoraHHMM(d = new Date()) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
