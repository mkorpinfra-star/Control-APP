import { Routes, Route, Navigate } from 'react-router-dom';
import LandingHome from '../pages/landing/Home';

export default function LandingRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingHome />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
