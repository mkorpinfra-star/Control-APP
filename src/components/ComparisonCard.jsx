import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from './Icons';
import { colors, spacing, typography, borderRadius } from '../styles/cloudflare-design';

export default function ComparisonCard({ title, current, previous, format = 'number', icon, suffix = '' }) {
    if (!previous || previous === 0) {
        return (
            <div style={{
                padding: spacing.lg,
                background: 'white',
                border: `1px solid ${colors.gray200}`,
                borderRadius: borderRadius.md
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.sm,
                    marginBottom: spacing.sm
                }}>
                    {icon}
                    <span style={{
                        fontSize: typography.sm,
                        color: colors.gray600,
                        fontWeight: typography.medium
                    }}>
                        {title}
                    </span>
                </div>
                <div style={{
                    fontSize: typography['3xl'],
                    fontWeight: typography.bold,
                    color: colors.gray900
                }}>
                    {formatValue(current, format)}{suffix}
                </div>
                <div style={{
                    fontSize: typography.xs,
                    color: colors.gray500,
                    marginTop: spacing.xs
                }}>
                    Sin datos previos para comparar
                </div>
            </div>
        );
    }

    const diff = current - previous;
    const percentChange = previous !== 0 ? ((diff / previous) * 100) : 0;
    const isPositive = diff > 0;
    const isNegative = diff < 0;
    const isNeutral = diff === 0;

    // Determinar si el cambio es "bueno" o "malo" según el contexto
    // Por ejemplo: más horas trabajadas = bom, más costos = neutro
    const isGoodChange = isPositive; // Pode ser customizado por tipo

    return (
        <div style={{
            padding: spacing.lg,
            background: 'white',
            border: `1px solid ${colors.gray200}`,
            borderRadius: borderRadius.md,
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Indicator bar */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: isNeutral ? colors.gray300 : isPositive ? colors.success : colors.danger
            }} />

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm,
                marginBottom: spacing.sm
            }}>
                {icon}
                <span style={{
                    fontSize: typography.sm,
                    color: colors.gray600,
                    fontWeight: typography.medium
                }}>
                    {title}
                </span>
            </div>

            <div style={{
                fontSize: typography['3xl'],
                fontWeight: typography.bold,
                color: colors.gray900,
                marginBottom: spacing.sm
            }}>
                {formatValue(current, format)}{suffix}
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xs
            }}>
                {isPositive && <TrendingUpIcon size={16} />}
                {isNegative && <TrendingDownIcon size={16} />}
                {isNeutral && <MinusIcon size={16} />}

                <span style={{
                    fontSize: typography.sm,
                    fontWeight: typography.semibold,
                    color: isNeutral ? colors.gray500 : isPositive ? colors.success : colors.danger
                }}>
                    {isNeutral ? '0%' : `${isPositive ? '+' : ''}${percentChange.toFixed(1)}%`}
                </span>

                <span style={{
                    fontSize: typography.xs,
                    color: colors.gray500
                }}>
                    vs período anterior
                </span>
            </div>

            <div style={{
                marginTop: spacing.sm,
                fontSize: typography.xs,
                color: colors.gray500
            }}>
                Anterior: {formatValue(previous, format)}{suffix}
            </div>
        </div>
    );
}

function formatValue(value, format) {
    if (value === null || value === undefined) return '—';

    switch (format) {
        case 'currency':
            return `€${value.toFixed(2)}`;
        case 'number':
            return value.toLocaleString('es-ES');
        case 'decimal':
            return value.toFixed(1);
        case 'percent':
            return `${value.toFixed(1)}%`;
        default:
            return value;
    }
}
