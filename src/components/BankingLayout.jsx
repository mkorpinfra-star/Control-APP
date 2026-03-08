import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import DynamicHeader from './DynamicHeader';
import BottomNav from './BottomNav';

// Otimizado para 60fps - apenas transform e opacity (GPU-accelerated)
const pageVariants = {
  initial: {
    x: 30,
    opacity: 0
  },
  enter: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 380,
      damping: 32,
      mass: 0.6
    }
  },
  exit: {
    x: -20,
    opacity: 0,
    transition: {
      type: 'spring',
      stiffness: 380,
      damping: 32,
      mass: 0.6,
      duration: 0.15
    }
  }
};

export default function BankingLayout() {
  const location = useLocation();

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header Fixo */}
      <DynamicHeader />

      {/* Main Content Scrollável com Nubank-style transitions */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative" style={{
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'smooth'
      }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className="w-full h-full"
            style={{
              willChange: 'transform, opacity'
            }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Fixo */}
      <BottomNav />

      {/* Safe Area Styles + iOS Momentum Scroll */}
      <style jsx global>{`
        .safe-area-top {
          padding-top: env(safe-area-inset-top);
        }
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
        * {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  );
}
