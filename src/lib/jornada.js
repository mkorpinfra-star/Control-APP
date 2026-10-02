// Cálculo de horas da jornada. Regra adotada (validar com RH/jurídico):
// - jornada normal de 8h/dia (480 min); excedente = extra;
// - se um horário é MENOR que o anterior, considera que passou da meia-noite
//   (ex.: entrada 22:00, saída 06:00 = 8h). Antes o cálculo zerava essas jornadas.
const JORNADA_MIN = 480;
const toMin = (t) => { const [h, m] = String(t).slice(0, 5).split(':').map(Number); return h * 60 + m; };

// Converte a sequência de horários em minutos contínuos, somando 24h a cada "volta" do relógio
function linhaDoTempo(horarios) {
  let dia = 0, anterior = null;
  return horarios.map(t => {
    if (!t) return null;
    let m = toMin(t) + dia;
    if (anterior !== null && m < anterior) { dia += 1440; m += 1440; }
    anterior = m;
    return m;
  });
}

export function calcHoras(entrada, saida, almSaida, almVolta) {
  if (!entrada || !saida) return { normais: 0, extras: 0 };
  const temAlmoco = almSaida && almVolta;
  const [e, as, av, s] = linhaDoTempo([entrada, temAlmoco ? almSaida : null, temAlmoco ? almVolta : null, saida]);
  let total = s - e;
  if (temAlmoco) total -= (av - as);
  total = Math.max(0, Math.min(total, 1440));
  const normais = Math.min(total, JORNADA_MIN) / 60;
  const extras = Math.max(0, total - JORNADA_MIN) / 60;
  return { normais: parseFloat(normais.toFixed(2)), extras: parseFloat(extras.toFixed(2)) };
}
