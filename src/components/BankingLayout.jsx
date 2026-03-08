import { Outlet } from 'react-router-dom';
import DynamicHeader from './DynamicHeader';
import BottomNav from './BottomNav';

export default function BankingLayout() {
  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header Fixo */}
      <DynamicHeader />

      {/* Main Content Scrollável */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative" style={{
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'smooth'
      }}>
        <Outlet />
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
