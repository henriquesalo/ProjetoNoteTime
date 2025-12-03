import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, LayoutDashboard, Clock, Users, Scissors, LogOut, Menu, UserRound } from 'lucide-react';

const navigationItems = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Agenda", path: "/agenda", icon: Calendar },
  { title: "Novo Agendamento", path: "/novo-agendamento", icon: Clock },
  { title: "Meus Agendamentos", path: "/meus-agendamentos", icon: Calendar },
  { title: "Barbeiros", path: "/barbeiros", icon: Users },
  { title: "Clientes", path: "/clientes", icon: UserRound },
  { title: "Serviços", path: "/servicos", icon: Scissors },
];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const filteredNavigationItems = navigationItems.filter((item) => {
    // Barbeiro não pode criar novo agendamento
    if (user?.role === 'BARBER' && item.path === '/novo-agendamento') {
      return false;
    }
    return true;
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-zinc-900">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-zinc-800 border-r border-zinc-700">
        {/* Header */}
        <div className="p-6 border-b border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Scissors className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">NoteTime</h2>
              <p className="text-xs text-zinc-400">Sistema de Gestão</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-3">
          <ul className="space-y-1">
            {filteredNavigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                      ? 'bg-amber-500/10 text-amber-500 border-l-2 border-amber-500'
                      : 'text-zinc-300 hover:bg-zinc-700 hover:text-amber-500'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-700">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user?.nome?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white text-sm truncate">{user?.nome}</p>
              <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <header className="md:hidden bg-zinc-800 border-b border-zinc-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-xl font-semibold text-white">NoteTime</h1>
            <div className="w-6" />
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        >
          <aside className="w-64 h-full bg-zinc-800" onClick={(e) => e.stopPropagation()}>
            {/* Mesmo conteúdo da sidebar desktop */}
          </aside>
        </div>
      )}
    </div>
  );
}
