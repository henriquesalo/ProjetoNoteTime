import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Agenda from './pages/Agenda.jsx';
import Barbeiros from './pages/Barbeiros.jsx';
import Servicos from './pages/Servicos.jsx';
import Clientes from './pages/Clientes.jsx';
import NovoAgendamento from './pages/NovoAgendamento.jsx';
import MeusAgendamentos from './pages/MeusAgendamentos.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/agenda" element={<ProtectedRoute><Agenda /></ProtectedRoute>} />
            <Route path="/barbeiros" element={<ProtectedRoute><Barbeiros /></ProtectedRoute>} />
            <Route path="/clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
            <Route path="/servicos" element={<ProtectedRoute><Servicos /></ProtectedRoute>} />
            <Route path="/novo-agendamento" element={<ProtectedRoute><NovoAgendamento /></ProtectedRoute>} />
            <Route path="/meus-agendamentos" element={<ProtectedRoute><MeusAgendamentos /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;