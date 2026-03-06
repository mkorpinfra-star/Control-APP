import { cn } from '../../lib/utils'

// Cards limpos e modernos
export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'bg-white text-gray-900 rounded-lg shadow-sm border border-gray-200',
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
