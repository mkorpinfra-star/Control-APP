/**
 * HOOK DE PAGINAÇÃO REUTILIZÁVEL
 * Use em TODAS as listas do sistema
 */

import { useState, useMemo } from 'react';

export function usePagination(items, itemsPerPage = 20) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(items.length / itemsPerPage);

    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return items.slice(start, end);
    }, [items, currentPage, itemsPerPage]);

    const goToPage = (page) => {
        const pageNumber = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(pageNumber);
    };

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const reset = () => {
        setCurrentPage(1);
    };

    return {
        currentItems,
        currentPage,
        totalPages,
        totalItems: items.length,
        goToPage,
        nextPage,
        prevPage,
        reset,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
        startIndex: (currentPage - 1) * itemsPerPage + 1,
        endIndex: Math.min(currentPage * itemsPerPage, items.length),
    };
}
