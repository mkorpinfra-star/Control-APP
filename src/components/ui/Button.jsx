import { cn } from '../../lib/utils'

const sizes = {
  sm: 'px-3 py-1.5 text-sm min-h-[36px]',
  md: 'px-4 py-2 text-base min-h-[44px]',
  lg: 'px-6 py-3 text-lg min-h-[52px]'
}

const variantStyles = {
  primary: {
    base: 'bg-white text-black border-2 font-bold shadow-md transition-all',
    style: { borderColor: '#CE0201' },
    hoverStyle: { backgroundColor: '#CE0201', color: 'white' }
  },
  secondary: {
    base: 'text-white border-2 font-semibold transition-all',
    style: { backgroundColor: '#1f2937', borderColor: '#CE0201' }
  },
  danger: {
    base: 'text-white border-2 font-bold shadow-lg transition-all',
    style: { backgroundColor: '#CE0201', borderColor: '#CE0201', color: 'white' }
  },
  success: {
    base: 'text-white border-2 font-semibold transition-all',
    style: { backgroundColor: '#16a34a', borderColor: '#16a34a', color: 'white' }
  },
  outline: {
    base: 'bg-transparent border-2 font-semibold transition-all',
    style: { borderColor: '#CE0201', color: '#CE0201' }
  },
  ghost: {
    base: 'bg-transparent font-semibold transition-all',
    style: { color: '#CE0201' }
  }
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  loading,
  style: styleProp,
  ...props
}) {
  const variantConfig = variantStyles[variant] || variantStyles.primary

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantConfig.base,
        sizes[size],
        className
      )}
      style={{ ...variantConfig.style, ...styleProp }}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  )
}
