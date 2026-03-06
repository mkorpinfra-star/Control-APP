/**
 * DESIGN SYSTEM ESTILO CLOUDFLARE
 * Limpo, profissional, sem sombras, com bordas cinza
 */

export const colors = {
    // Cinzas (Cloudflare style)
    gray50: '#fafafa',
    gray100: '#f4f4f5',
    gray200: '#e4e4e7',
    gray300: '#d4d4d8',
    gray400: '#a1a1aa',
    gray500: '#71717a',
    gray600: '#52525b',
    gray700: '#3f3f46',
    gray800: '#27272a',
    gray900: '#18181b',

    // Brand
    primary: '#CE0201',
    primaryHover: '#a60101',
    primaryLight: '#fef2f2',

    // Status
    success: '#16a34a',
    successLight: '#f0fdf4',
    successBorder: '#86efac',

    warning: '#f59e0b',
    warningLight: '#fffbeb',
    warningBorder: '#fcd34d',

    error: '#dc2626',
    errorLight: '#fef2f2',
    errorBorder: '#fca5a5',

    info: '#3b82f6',
    infoLight: '#eff6ff',
    infoBorder: '#93c5fd',

    // Data viz (sem emoji, cores profissionais)
    chartGreen: '#16a34a',
    chartYellow: '#f59e0b',
    chartBlue: '#3b82f6',
    chartPurple: '#8b5cf6',
    chartRed: '#dc2626',
};

export const spacing = {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '40px',
};

export const borderRadius = {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
};

export const typography = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',

    // Tamanhos
    xs: '12px',
    sm: '13px',
    base: '14px',
    md: '15px',
    lg: '16px',
    xl: '18px',
    '2xl': '20px',
    '3xl': '24px',
    '4xl': '32px',

    // Pesos
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
};

export const components = {
    // Card estilo Cloudflare
    card: {
        background: '#ffffff',
        border: `1px solid ${colors.gray200}`,
        borderRadius: borderRadius.lg,
        padding: spacing['2xl'],
    },

    // Input/Select
    input: {
        height: '40px',
        padding: `0 ${spacing.md}`,
        border: `1px solid ${colors.gray300}`,
        borderRadius: borderRadius.md,
        fontSize: typography.base,
        fontFamily: typography.fontFamily,
        background: '#ffffff',
        transition: 'all 0.15s ease',
        ':focus': {
            outline: 'none',
            borderColor: colors.primary,
            boxShadow: `0 0 0 3px ${colors.primaryLight}`,
        },
    },

    // Button
    button: {
        height: '40px',
        padding: `0 ${spacing.lg}`,
        border: 'none',
        borderRadius: borderRadius.md,
        fontSize: typography.base,
        fontWeight: typography.semibold,
        fontFamily: typography.fontFamily,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
    },

    buttonPrimary: {
        background: colors.primary,
        color: '#ffffff',
        ':hover': {
            background: colors.primaryHover,
        },
        ':disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
        },
    },

    buttonSecondary: {
        background: '#ffffff',
        color: colors.gray700,
        border: `1px solid ${colors.gray300}`,
        ':hover': {
            background: colors.gray50,
            borderColor: colors.gray400,
        },
    },

    // Badge
    badge: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: `${spacing.xs} ${spacing.sm}`,
        borderRadius: borderRadius.sm,
        fontSize: typography.xs,
        fontWeight: typography.medium,
        gap: spacing.xs,
    },

    // Table
    table: {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: 0,
    },

    tableHeader: {
        background: colors.gray50,
        borderTop: `1px solid ${colors.gray200}`,
        borderBottom: `1px solid ${colors.gray200}`,
        padding: spacing.md,
        textAlign: 'left',
        fontSize: typography.sm,
        fontWeight: typography.semibold,
        color: colors.gray700,
    },

    tableCell: {
        padding: spacing.md,
        borderBottom: `1px solid ${colors.gray200}`,
        fontSize: typography.base,
        color: colors.gray900,
    },

    // Alert
    alert: {
        padding: spacing.lg,
        borderRadius: borderRadius.md,
        border: '1px solid',
        fontSize: typography.sm,
        display: 'flex',
        alignItems: 'flex-start',
        gap: spacing.md,
    },
};

// Ícones SVG profissionais (sem emoji)
export const icons = {
    // Sizes
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
};

export default {
    colors,
    spacing,
    borderRadius,
    typography,
    components,
    icons,
};
