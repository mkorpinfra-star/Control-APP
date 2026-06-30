import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import DynamicHeader from './DynamicHeader';
import BottomNav from './BottomNav';

// Transição estilo Nubank - Slide horizontal suave
const pageVariants = {
  initial: {
    x: '100%',
    opacity: 0
  },
  enter: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      mass: 0.8
    }
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
};

export default function BankingLayout() {
  const location = useLocation();

  return (
    <div className="h-screen flex flex-col bg-[#0A0B0D] overflow-hidden">
      {/* Header Fixo */}
      <DynamicHeader />

      {/* Main Content Scrollável com transição Nubank */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className="absolute inset-0 overflow-y-auto overflow-x-hidden"
            style={{
              WebkitOverflowScrolling: 'touch'
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
