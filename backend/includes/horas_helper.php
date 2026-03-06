<?php
/**
 * Helper: calcular horas a partir do JSON horas_diarias
 * Suporta festivos: festivo = 8h para folha (empresa), 0h para faturamento (cliente)
 */

/**
 * Calcula horas de um JSON horas_diarias
 * @param string|array $raw  — valor do campo horas_diarias
 * @param bool $paraCliente  — true = festivo conta 0h | false = festivo conta 8h (empresa)
 * @return array ['normais'=>float, 'extra'=>float, 'noturna'=>float, 'festivos'=>int]
 */
function calcularHorasJson($raw, bool $paraCliente = false): array {
    $hd = is_string($raw) ? json_decode($raw, true) : $raw;
    $normais = 0.0; $extra = 0.0; $noturna = 0.0; $festivos = 0;

    if (!is_array($hd)) return ['normais' => 0, 'extra' => 0, 'noturna' => 0, 'festivos' => 0];

    foreach ($hd as $dayKey => $h) {
        if (!is_array($h)) {
            // formato antigo: {"mon": 8, ...}
            if (is_numeric($h)) $normais += floatval($h);
            continue;
        }

        if (!empty($h['festivo'])) {
            $festivos++;
            if (!$paraCliente) {
                // empresa paga 8h normais por dia festivo
                $normais += 8.0;
            }
            // para cliente: 0h (não soma nada)
        } else {
            $normais  += floatval($h['normal']  ?? 0);
            $extra    += floatval($h['extra']   ?? 0);
            $noturna  += floatval($h['noturna'] ?? 0);
        }
    }

    return [
        'normais'  => $normais,
        'extra'    => $extra,
        'noturna'  => $noturna,
        'festivos' => $festivos,
    ];
}
