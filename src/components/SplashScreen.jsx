import { useEffect, useState } from 'react';

export default function SplashScreen({ onFinish }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Depois de 2.5 segundos, começa a fade out
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Depois do fade out (0.5s), chama onFinish
      setTimeout(onFinish, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        background: 'linear-gradient(135deg, #CE0201 0%, #8a0000 100%)',
      }}
    >
      <div className="text-center">
        {/* Logo J2S com animação pulse */}
        <div className="mb-8 animate-pulse">
          <div
            className="w-32 h-32 mx-auto rounded-3xl flex items-center justify-center shadow-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <span className="text-6xl font-bold text-white">J2S</span>
          </div>
        </div>

        {/* Nome do app com animação slide up */}
        <div className="animate-fadeInUp">
          <h1 className="text-4xl font-bold text-white mb-2">J2S APP</h1>
          <p className="text-white/80 text-lg">Gestión de Obras</p>
        </div>

        {/* Loading dots */}
        <div className="mt-12 flex justify-center gap-2">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
          animation-delay: 0.3s;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
