import { Outlet } from 'react-router-dom';
import BankingHeader from './BankingHeader';
import BottomNav from './BottomNav';

export default function BankingLayout() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <BankingHeader />

      {/* Main Content */}
      <main className="min-h-[calc(100vh-theme(spacing.20))]">
        <Outlet />
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
