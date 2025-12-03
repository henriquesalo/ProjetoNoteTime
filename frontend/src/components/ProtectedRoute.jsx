import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  //  Barbeiro não pode acessar novo agendamento
  if (user?.role === 'BARBER' && location.pathname === '/novo-agendamento') {
    return <Navigate to="/agenda" replace />;
  }

  return <Layout>{children}</Layout>;
}
