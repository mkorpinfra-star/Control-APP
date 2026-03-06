/**
 * COMPONENTE DE PAGINAÇÃO PROFISSIONAL
 * Estilo Cloudflare
 */

import { ChevronLeftIcon, ChevronRightIcon } from './Icons';
import { colors, spacing, typography } from '../styles/cloudflare-design';

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    startIndex,
    endIndex,
    className = ''
}) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const showEllipsisStart = currentPage > 3;
        const showEllipsisEnd = currentPage < totalPages - 2;

        // Always show first page
        pages.push(1);

        // Show ellipsis or pages near start
        if (showEllipsisStart) {
            pages.push('...');
        } else {
            for (let i = 2; i < Math.min(4, totalPages); i++) {
                pages.push(i);
            }
        }

        // Show pages around current
        if (currentPage > 3 && currentPage < totalPages - 2) {
            for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                if (i > 1 && i < totalPages) {
                    pages.push(i);
                }
            }
        }

        // Show ellipsis or pages near end
        if (showEllipsisEnd) {
            pages.push('...');
        } else {
            for (let i = Math.max(totalPages - 2, 2); i < totalPages; i++) {
                if (i > 1) {
                    pages.push(i);
                }
            }
        }

        // Always show last page
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        // Remove duplicates
        return [...new Set(pages)];
    };

    const pageNumbers = getPageNumbers();

    const buttonStyle = {
        padding: `${spacing.sm} ${spacing.md}`,
        border: `1px solid ${colors.gray300}`,
        background: 'white',
        cursor: 'pointer',
        fontSize: typography.sm,
        fontWeight: typography.medium,
        color: colors.gray700,
        transition: 'all 0.2s',
        minWidth: '40px',
        height: '40px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
        marginRight: spacing.xs,
    };

    const activeButtonStyle = {
        ...buttonStyle,
        background: colors.primary,
        color: 'white',
        borderColor: colors.primary,
    };

    const disabledButtonStyle = {
        ...buttonStyle,
        cursor: 'not-allowed',
        opacity: 0.5,
        color: colors.gray400,
    };

    return (
        <div className={className} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: spacing.lg,
            flexWrap: 'wrap',
            gap: spacing.md,
        }}>
            {/* Info text */}
            <div style={{
                fontSize: typography.sm,
                color: colors.gray600,
            }}>
                Mostrando <strong>{startIndex}</strong> a <strong>{endIndex}</strong> de <strong>{totalItems}</strong> resultados
            </div>

            {/* Pagination buttons */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* Previous button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={currentPage === 1 ? disabledButtonStyle : buttonStyle}
                    aria-label="Página anterior"
                >
                    <ChevronLeftIcon size={16} />
                </button>

                {/* Page numbers */}
                {pageNumbers.map((page, index) => {
                    if (page === '...') {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                style={{
                                    padding: `${spacing.sm} ${spacing.xs}`,
                                    color: colors.gray400,
                                    fontSize: typography.sm,
                                }}
                            >
                                ...
                            </span>
                        );
                    }

                    return (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            style={page === currentPage ? activeButtonStyle : buttonStyle}
                            aria-label={`Página ${page}`}
                            aria-current={page === currentPage ? 'page' : undefined}
                        >
                            {page}
                        </button>
                    );
                })}

                {/* Next button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={currentPage === totalPages ? disabledButtonStyle : buttonStyle}
                    aria-label="Próxima página"
                >
                    <ChevronRightIcon size={16} />
                </button>
            </div>
        </div>
    );
}
