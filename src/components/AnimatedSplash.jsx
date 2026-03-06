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
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
    >
      {/* Logo J2S com animação */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1], // Ease out expo
        }}
        className="mb-4"
      >
        <motion.h1
          className="text-8xl font-black text-[#CE0201]"
          style={{ fontFamily: 'Arial, sans-serif' }}
          animate={{
            textShadow: [
              '0 0 20px rgba(206, 2, 1, 0.5)',
              '0 0 40px rgba(206, 2, 1, 0.8)',
              '0 0 20px rgba(206, 2, 1, 0.5)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          J2S
        </motion.h1>
      </motion.div>

      {/* Enginyeria - desliza de baixo */}
      <motion.h2
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          delay: 0.5,
          duration: 0.6,
          ease: 'easeOut',
        }}
        className="text-3xl font-normal text-white mb-1"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        Enginyeria
      </motion.h2>

      {/* & Instal·lacions - desliza de baixo com delay */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          delay: 0.8,
          duration: 0.6,
          ease: 'easeOut',
        }}
        className="text-lg text-gray-400"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        & Instal·lacions
      </motion.p>

      {/* Loading bar animado */}
      <motion.div
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{
          delay: 1.2,
          duration: 1.3,
          ease: 'easeInOut',
        }}
        className="absolute bottom-0 left-0 h-1 bg-[#CE0201]"
      />
    </motion.div>
  );
}
