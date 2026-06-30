import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function AnimatedSplash({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Duração total: 2.5 segundos
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete?.();
      }, 500); // Espera fade out completar
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0B0D] overflow-hidden"
    >
      {/* Logo Mkorp */}
      <motion.img
        src="/logo-mkorp.png"
        alt="Mkorp"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="h-10 w-auto mb-4 relative z-10"
      />

      {/* Subtítulo */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
        className="text-sm text-[#6B7280] relative z-10"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        Gestão de iluminação pública
      </motion.p>

      {/* Loading bar animado */}
      <motion.div
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ delay: 1.2, duration: 1.3, ease: 'easeInOut' }}
        className="absolute bottom-0 left-0 h-1 bg-[#F08020]"
      />
    </motion.div>
  );
}
