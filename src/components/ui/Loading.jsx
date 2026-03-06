import { cn } from '../../lib/utils'

// ESTILO BRASILEIRO FORTE - Loading com fundo PRETO
export function Loading({ size = 'md', text, className }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 p-8', className)}>
      <div className={cn(
        sizes[size],
        'border-gray-700 border-t-j2s-red rounded-full animate-spin'
      )} />
      {text && <p className="text-sm text-white font-semibold">{text}</p>}
    </div>
  )
}

export function LoadingOverlay({ text }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white border-2 border-j2s-red rounded-lg p-8 shadow-2xl">
        <Loading size="lg" text={text} className="text-black" />
      </div>
    </div>
  )
}
