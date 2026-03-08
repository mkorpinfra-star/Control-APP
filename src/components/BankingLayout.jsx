import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import DynamicHeader from './DynamicHeader';
import BottomNav from './BottomNav';

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
    x: '-20%',
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeInOut'
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
      <main className="flex-1 overflow-y-auto overflow-x-hidden" style={{
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
            className="w-full min-h-full"
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
