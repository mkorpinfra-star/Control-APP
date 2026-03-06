import { cn } from '../../lib/utils'
import { X } from 'lucide-react'

export function Modal({ isOpen, onClose, children, className }) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <div
        className={cn(
          'bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export function ModalHeader({ children, onClose, className }) {
  return (
    <div className={cn('flex items-center justify-between px-6 py-4 border-b border-gray-200', className)}>
      <h2 className="text-xl font-semibold text-gray-900">{children}</h2>
      {onClose && (
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <XIcon size={20} />
        </button>
      )}
    </div>
  )
}

export function ModalBody({ children, className }) {
  return (
    <div className={cn('px-6 py-4 overflow-y-auto flex-1', className)}>
      {children}
    </div>
  )
}

export function ModalFooter({ children, className }) {
  return (
    <div className={cn('px-6 py-4 border-t border-gray-200 flex gap-3 justify-end', className)}>
      {children}
    </div>
  )
}
