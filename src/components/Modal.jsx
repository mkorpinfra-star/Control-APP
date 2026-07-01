import { motion, AnimatePresence } from 'framer-motion';
import { IconX } from '@tabler/icons-react';

export default function Modal({ aberto, onClose, titulo, children }) {
  return (
    <AnimatePresence>
      {aberto && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative bg-[#0E0F13] border-t border-[#23262E] rounded-t-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-[#0E0F13] px-4 pt-4 pb-3 border-b border-[#23262E] flex items-center justify-between z-10">
              <h2 className="font-semibold text-[#F5F5F0] text-base">{titulo}</h2>
              <button onClick={onClose} className="text-[#6B7280] hover:text-[#F5F5F0] transition-colors">
                <IconX size={20} />
              </button>
            </div>
            <div className="p-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
