/**
 * COMPONENTES REUTILIZÁVEIS ESTILO CLOUDFLARE
 * Para usar em todas as páginas do sistema
 */
import designSystem from '../styles/cloudflare-design';

const { colors, spacing, typography, borderRadius, components } = designSystem;

// ============= PAGE HEADER =============
export const PageHeader = ({ title, subtitle, actions, children }) => (
    <div style={{
        marginBottom: spacing['3xl'],
        borderBottom: `1px solid ${colors.gray200}`,
        paddingBottom: spacing['2xl']
    }}>
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: spacing.lg
        }}>
            <div>
                <h1 style={{
                    fontSize: typography['4xl'],
                    fontWeight: typography.bold,
                    color: colors.gray900,
                    margin: 0
                }}>
                    {title}
                </h1>
                {subtitle && (
                    <p style={{
                        fontSize: typography.base,
                        color: colors.gray600,
                        marginTop: spacing.xs,
                        marginBottom: 0
                    }}>
                        {subtitle}
                    </p>
                )}
            </div>
            {actions && (
                <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap' }}>
                    {actions}
                </div>
            )}
        </div>
        {children}
    </div>
);

// ============= CARD =============
export const Card = ({ children, padding, style = {} }) => (
    <div style={{
        ...components.card,
        padding: padding || spacing['2xl'],
        ...style
    }}>
        {children}
    </div>
);

// ============= BUTTON =============
export const Button = ({
    children,
    onClick,
    variant = 'primary',
    disabled = false,
    type = 'button',
    icon,
    loading = false,
    style = {}
}) => {
    const baseStyle = {
        ...components.button,
        ...(variant === 'primary' ? components.buttonPrimary : components.buttonSecondary),
        ...(disabled && { opacity: 0.5, cursor: 'not-allowed' }),
        ...style
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            style={baseStyle}
        >
            {icon}
            {loading ? 'Cargando...' : children}
        </button>
    );
};

// ============= INPUT =============
export const Input = ({
    label,
    error,
    icon,
    ...props
}) => (
    <div style={{ marginBottom: spacing.lg }}>
        {label && (
            <label style={{
                display: 'block',
                fontSize: typography.sm,
                fontWeight: typography.medium,
                color: colors.gray700,
                marginBottom: spacing.xs
            }}>
                {label}
            </label>
        )}
        <div style={{ position: 'relative' }}>
            {icon && (
                <div style={{
                    position: 'absolute',
                    left: spacing.md,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: colors.gray400
                }}>
                    {icon}
                </div>
            )}
            <input
                {...props}
                style={{
                    ...components.input,
                    width: '100%',
                    paddingLeft: icon ? '40px' : spacing.md,
                    ...(error && {
                        borderColor: colors.error,
                        boxShadow: `0 0 0 3px ${colors.errorLight}`
                    })
                }}
            />
        </div>
        {error && (
            <p style={{
                fontSize: typography.xs,
                color: colors.error,
                marginTop: spacing.xs,
                marginBottom: 0
            }}>
                {error}
            </p>
        )}
    </div>
);

// ============= SELECT =============
export const Select = ({ label, error, children, ...props }) => (
    <div style={{ marginBottom: spacing.lg }}>
        {label && (
            <label style={{
                display: 'block',
                fontSize: typography.sm,
                fontWeight: typography.medium,
                color: colors.gray700,
                marginBottom: spacing.xs
            }}>
                {label}
            </label>
        )}
        <select
            {...props}
            style={{
                ...components.input,
                width: '100%',
                ...(error && {
                    borderColor: colors.error,
                    boxShadow: `0 0 0 3px ${colors.errorLight}`
                })
            }}
        >
            {children}
        </select>
        {error && (
            <p style={{
                fontSize: typography.xs,
                color: colors.error,
                marginTop: spacing.xs,
                marginBottom: 0
            }}>
                {error}
            </p>
        )}
    </div>
);

// ============= TABLE =============
export const Table = ({ columns, data, actions, emptyMessage = 'No hay datos' }) => {
    if (!data || data.length === 0) {
        return (
            <Card>
                <div style={{
                    textAlign: 'center',
                    padding: spacing['3xl'],
                    color: colors.gray500
                }}>
                    {emptyMessage}
                </div>
            </Card>
        );
    }

    return (
        <Card padding="0" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
                <table style={components.table}>
                    <thead>
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    style={{
                                        ...components.tableHeader,
                                        textAlign: col.align || 'left'
                                    }}
                                >
                                    {col.header}
                                </th>
                            ))}
                            {actions && (
                                <th style={{
                                    ...components.tableHeader,
                                    textAlign: 'center',
                                    width: '120px'
                                }}>
                                    Acciones
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, rowIdx) => (
                            <tr key={rowIdx}>
                                {columns.map((col, colIdx) => (
                                    <td
                                        key={colIdx}
                                        style={{
                                            ...components.tableCell,
                                            textAlign: col.align || 'left'
                                        }}
                                    >
                                        {col.render ? col.render(row) : row[col.key]}
                                    </td>
                                ))}
                                {actions && (
                                    <td style={{
                                        ...components.tableCell,
                                        textAlign: 'center'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            gap: spacing.xs,
                                            justifyContent: 'center'
                                        }}>
                                            {actions(row)}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

// ============= BADGE =============
export const Badge = ({ children, variant = 'default', style = {} }) => {
    const variants = {
        default: { background: colors.gray100, color: colors.gray700 },
        neutral: { background: colors.gray100, color: colors.gray700 },
        success: { background: colors.successLight, color: colors.success },
        warning: { background: colors.warningLight, color: colors.warning },
        error: { background: colors.errorLight, color: colors.error },
        danger: { background: colors.errorLight, color: colors.error },
        info: { background: colors.infoLight, color: colors.info }
    };

    return (
        <span style={{
            ...components.badge,
            ...(variants[variant] || variants.default),
            ...style
        }}>
            {children}
        </span>
    );
};

// ============= MODAL =============
export const Modal = ({ isOpen, onClose, title, children, footer, size = 'medium' }) => {
    if (!isOpen) return null;

    const sizes = {
        small: '400px',
        medium: '600px',
        large: '800px',
        xlarge: '1000px'
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: spacing.lg
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: '#fff',
                    borderRadius: borderRadius.lg,
                    width: '100%',
                    maxWidth: sizes[size],
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    border: `1px solid ${colors.gray200}`
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: spacing['2xl'],
                    borderBottom: `1px solid ${colors.gray200}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{
                        fontSize: typography.xl,
                        fontWeight: typography.semibold,
                        color: colors.gray900,
                        margin: 0
                    }}>
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            padding: spacing.xs,
                            color: colors.gray500
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div style={{
                    padding: spacing['2xl'],
                    flex: 1,
                    overflowY: 'auto'
                }}>
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div style={{
                        padding: spacing['2xl'],
                        borderTop: `1px solid ${colors.gray200}`,
                        display: 'flex',
                        gap: spacing.md,
                        justifyContent: 'flex-end'
                    }}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

// ============= SEARCH BAR =============
export const SearchBar = ({ value, onChange, placeholder = 'Buscar...', icon }) => (
    <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
        <div style={{
            position: 'absolute',
            left: spacing.md,
            top: '50%',
            transform: 'translateY(-50%)',
            color: colors.gray400
        }}>
            {icon || (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
            )}
        </div>
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            style={{
                ...components.input,
                width: '100%',
                paddingLeft: '40px'
            }}
        />
    </div>
);

// ============= ALERT =============
export const Alert = ({ children, variant = 'info', icon, onClose }) => {
    const variants = {
        success: {
            bg: colors.successLight,
            border: colors.successBorder,
            color: colors.success
        },
        warning: {
            bg: colors.warningLight,
            border: colors.warningBorder,
            color: colors.warning
        },
        error: {
            bg: colors.errorLight,
            border: colors.errorBorder,
            color: colors.error
        },
        danger: {
            bg: colors.errorLight,
            border: colors.errorBorder,
            color: colors.error
        },
        info: {
            bg: colors.infoLight,
            border: colors.infoBorder,
            color: colors.info
        }
    };

    const style = variants[variant] || variants.info;

    return (
        <div style={{
            ...components.alert,
            background: style.bg,
            borderColor: style.border,
            color: style.color
        }}>
            {icon && <div>{icon}</div>}
            <div style={{ flex: 1 }}>{children}</div>
            {onClose && (
                <button
                    onClick={onClose}
                    style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        color: style.color,
                        padding: 0
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            )}
        </div>
    );
};

// ============= LOADING =============
export const Loading = ({ message = 'Cargando...' }) => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing['4xl'],
        color: colors.gray500
    }}>
        <div className="loading-spinner" style={{ marginBottom: spacing.lg }}></div>
        <p style={{ fontSize: typography.base, margin: 0 }}>{message}</p>
    </div>
);

// ============= EMPTY STATE =============
export const EmptyState = ({ title, description, action, icon }) => (
    <Card>
        <div style={{
            textAlign: 'center',
            padding: spacing['4xl'],
            color: colors.gray500
        }}>
            {icon && <div style={{ marginBottom: spacing.lg }}>{icon}</div>}
            <h3 style={{
                fontSize: typography.xl,
                fontWeight: typography.semibold,
                color: colors.gray900,
                marginBottom: spacing.sm
            }}>
                {title}
            </h3>
            {description && (
                <p style={{
                    fontSize: typography.base,
                    color: colors.gray600,
                    marginBottom: spacing.xl
                }}>
                    {description}
                </p>
            )}
            {action}
        </div>
    </Card>
);
