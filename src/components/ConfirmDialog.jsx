import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning', // warning, info, success, danger
  loading = false
}) {
  if (!isOpen) return null;

  const typeConfig = {
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-200',
      buttonBg: 'bg-amber-600 hover:bg-amber-700'
    },
    info: {
      icon: Info,
      bgColor: 'bg-red-50',
      iconColor: 'text-[#CE0201]',
      borderColor: 'border-red-200',
      buttonBg: 'bg-[#CE0201] hover:bg-[#A00101]'
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200',
      buttonBg: 'bg-green-600 hover:bg-green-700'
    },
    danger: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200',
      buttonBg: 'bg-red-600 hover:bg-red-700'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={loading ? undefined : onClose}
      ></div>

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
        {/* Icon */}
        <div className="flex justify-center pt-8">
          <div className={`w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center`}>
            <Icon size={32} className={config.iconColor} strokeWidth={2} />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-4 bg-[#F5F5F5] hover:bg-gray-200 text-gray-900 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-3 px-4 ${config.buttonBg} text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95`}
          >
            {loading ? 'Aguarde...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
