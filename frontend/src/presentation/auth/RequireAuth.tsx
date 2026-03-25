import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

export default function RequireAuth() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f2f2f2] flex items-center justify-center px-6">
        <div className="font-mono text-[10px] font-bold tracking-[0.2em] text-iron-red animate-pulse uppercase">
          AUTH_HANDSHAKE_IN_PROGRESS...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
