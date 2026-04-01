import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './presentation/components/ToastProvider';
import Layout from './presentation/components/layout/Layout';
import RequireAuth from './presentation/auth/RequireAuth';
import DashboardView from './presentation/views/dashboard/DashboardView';
import AthleteView from './presentation/views/athlete/AthleteView';
import RosterSelectorView from './presentation/views/program/RosterSelectorView';
import ProgramView from './presentation/views/program/ProgramView';
import AnalyticsView from './presentation/views/analytics/AnalyticsView';
import InventoryView from './presentation/views/inventory/InventoryView';
import AuthLayout from './presentation/views/auth/AuthLayout';
import LoginView from './presentation/views/auth/LoginView';
import SignupView from './presentation/views/auth/SignupView';
import ForgotPasswordView from './presentation/views/auth/ForgotPasswordView';
import SupportView from './presentation/views/public/SupportView';
import TermsView from './presentation/views/public/TermsView';
import PrivacyView from './presentation/views/public/PrivacyView';

function App() {
  return (
    <ToastProvider>
      <Routes>
      {/* Public */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginView />} />
        <Route path="/signup" element={<SignupView />} />
        <Route path="/forgot-password" element={<ForgotPasswordView />} />
        <Route path="/support" element={<SupportView />} />
        <Route path="/terms" element={<TermsView />} />
        <Route path="/privacy" element={<PrivacyView />} />
      </Route>

      {/* Protected */}
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardView />} />
          <Route path="athletes" element={<AthleteView />} />
          <Route path="program-builder" element={<RosterSelectorView />} />
          <Route path="program-builder/editor/:athleteId" element={<ProgramView />} />
          <Route path="analytics" element={<AnalyticsView />} />
          <Route path="inventory" element={<InventoryView />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </ToastProvider>
  );
}

export default App;
