import { cn } from '../../lib/utils'

export function Table({ children, className, ...props }) {
  return (
    <div className="overflow-x-auto -mx-6 sm:mx-0">
      <div className="inline-block min-w-full align-middle px-6 sm:px-0">
        <table className={cn('min-w-full divide-y divide-gray-200', className)} {...props}>
          {children}
        </table>
      </div>
    </div>
  )
}

export function TableHeader({ children, className, ...props }) {
  return (
    <thead className={cn('bg-gray-50', className)} {...props}>
      {children}
    </thead>
  )
}

export function TableBody({ children, className, ...props }) {
  return (
    <tbody className={cn('bg-white divide-y divide-gray-200', className)} {...props}>
      {children}
    </tbody>
  )
}

export function TableRow({ children, className, hover = true, ...props }) {
  return (
    <tr className={cn(hover && 'hover:bg-gray-50 transition-colors', className)} {...props}>
      {children}
    </tr>
  )
}

export function TableHead({ children, className, ...props }) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider',
        className
      )}
      {...props}
    >
      {children}
    </th>
  )
}

export function TableCell({ children, className, ...props }) {
  return (
    <td className={cn('px-4 py-3 text-sm text-gray-900', className)} {...props}>
      {children}
    </td>
  )
}
