import { cn } from '../../lib/utils'
import { IconCircleCheck, IconAlertCircle, IconInfoCircle } from '@tabler/icons-react'

const variants = {
  success: {
    bg: 'bg-green-50 border-green-200',
    text: 'text-green-800',
    icon: IconCircleCheck
  },
  warning: {
    bg: 'bg-yellow-50 border-yellow-200',
    text: 'text-yellow-800',
    icon: IconAlertCircle
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-800',
    icon: IconAlertCircle
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-800',
    icon: IconInfoCircle
  }
}

export function Alert({ children, variant = 'info', className, ...props }) {
  const config = variants[variant]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border',
        config.bg,
        config.text,
        className
      )}
      {...props}
    >
      <Icon stroke={1} size={20} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1">{children}</div>
    </div>
  )
}
