import { cn } from '../../lib/utils'

export function Input({ label, error, className, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          {label}
          {props.required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <input
        className={cn(
          'w-full px-3 py-2 text-base border rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-j2s-red focus:border-transparent',
          'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500',
          error ? 'border-red-500' : 'border-gray-300',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export function Select({ label, error, children, className, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          {label}
          {props.required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <select
        className={cn(
          'w-full px-3 py-2 text-base border rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-j2s-red focus:border-transparent',
          'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500',
          error ? 'border-red-500' : 'border-gray-300',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export function Textarea({ label, error, className, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          {label}
          {props.required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <textarea
        className={cn(
          'w-full px-3 py-2 text-base border rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-j2s-red focus:border-transparent',
          'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500',
          error ? 'border-red-500' : 'border-gray-300',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
