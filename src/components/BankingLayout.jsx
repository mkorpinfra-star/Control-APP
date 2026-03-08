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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <DynamicHeader />

      {/* Main Content with Nubank-style transitions */}
      <main className="relative overflow-x-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Safe Area Styles */}
      <style jsx global>{`
        .safe-area-top {
          padding-top: env(safe-area-inset-top);
        }
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
}
