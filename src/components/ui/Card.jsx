import { cn } from '../../lib/utils'

// Cards limpos e modernos - estilo Nubank (sem bordas)
export function Card({ children, className, variant = 'default', ...props }) {
  const getVariantClasses = () => {
    if (variant === 'nubank') return 'bg-[#F5F5F5] shadow-sm';
    if (variant === 'nubank-no-shadow') return 'bg-[#F5F5F5]';
    return 'bg-white shadow-sm';
  };

  return (
    <div
      className={cn(
        'text-gray-900 rounded-xl',
        getVariantClasses(),
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-b border-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3
      className={cn(
        'text-xl font-bold text-black',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardBody({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'px-6 py-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
