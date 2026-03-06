/**
 * Wrapper responsivo para tabelas
 * Adiciona scroll horizontal em mobile automaticamente
 */
export default function ResponsiveTable({ children, className = '' }) {
    return (
        <div className={`overflow-x-auto -webkit-overflow-scrolling-touch ${className}`}>
            {children}
        </div>
    );
}
