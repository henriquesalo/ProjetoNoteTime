import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Scissors, AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.senha);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 relative overflow-hidden p-4">
      {/* Efeitos de Fundo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-amber-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-zinc-800/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[480px] relative z-10"> {/* Aumentei levemente a largura máxima */}
        
        {/* AQUI ESTÁ A CORREÇÃO DO ESPAÇAMENTO: p-8 para mobile, p-12 para desktop */}
        <div className="bg-zinc-900/60 backdrop-blur-xl p-8 sm:p-12 rounded-3xl shadow-2xl border border-white/5 ring-1 ring-white/5">
          
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-amber-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-700 shadow-xl">
                <Scissors className="w-10 h-10 text-amber-500 transform group-hover:-rotate-12 transition-transform duration-300" />
              </div>
            </div>
          </div>

          {/* Cabeçalho */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">Bem-vindo</h1>
            <p className="text-zinc-400 text-sm">Insira suas credenciais para acessar</p>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 animate-fadeIn">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Formulário - Aumentei o espaçamento vertical entre inputs (space-y-6) */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Input Email */}
            <div className="space-y-2">
              <label className="text-zinc-400 text-xs font-medium ml-1 uppercase tracking-wider">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-500 group-focus-within:text-amber-500 transition-colors duration-300" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-300"
                  placeholder="ex: admin@notetime.com"
                  required
                />
              </div>
            </div>

            {/* Input Senha */}
            <div className="space-y-2">
              <label className="text-zinc-400 text-xs font-medium ml-1 uppercase tracking-wider">
                Senha
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-500 group-focus-within:text-amber-500 transition-colors duration-300" />
                </div>
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  className="w-full pl-12 pr-12 py-4 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-300"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Botão de Login CORRIGIDO */}
            <button
              type="submit"
              disabled={loading}
              className={`
                w-full font-bold py-4 rounded-xl text-white mt-4
                bg-gradient-to-r from-amber-600 to-amber-500
                transition-all duration-300 ease-out 
                ${loading 
                  ? 'opacity-70 cursor-wait' 
                  : 'hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:brightness-110 active:scale-[0.98] hover:cursor-pointer'
                }
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  <span className="text-sm">Validando...</span>
                </span>
              ) : 'Acessar Sistema'}
            </button>
          </form>

          {/* Rodapé Teste */}
          <div className="mt-10 pt-6 border-t border-white/5">
            <div className="bg-zinc-950/40 rounded-lg p-4 border border-white/5">
              <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-3">Acesso Rápido</p>
              <div className="space-y-2">

                <div className="flex justify-between items-center text-xs group cursor-pointer hover:bg-white/5 p-1 rounded transition-colors"
                     onClick={() => setFormData({email: 'admin@notetime.com', senha: 'Admin@123456'})}>
                  <span className="text-zinc-400">Admin</span>
                  <span className="font-mono text-amber-500/80 group-hover:text-amber-400">Clique p/ preencher</span>
                </div>

                <div className="flex justify-between items-center text-xs group cursor-pointer hover:bg-white/5 p-1 rounded transition-colors"
                     onClick={() => setFormData({email: 'joao@notetime.com', senha: 'Barber@123456'})}>
                  <span className="text-zinc-400">Barbeiro 1</span>
                  <span className="font-mono text-amber-500/80 group-hover:text-amber-400">Clique p/ preencher</span>
                </div>

                <div className="flex justify-between items-center text-xs group cursor-pointer hover:bg-white/5 p-1 rounded transition-colors"
                     onClick={() => setFormData({email: 'pedro@notetime.com', senha: 'Barber@123456'})}>
                  <span className="text-zinc-400">Barbeiro 2</span>
                  <span className="font-mono text-amber-500/80 group-hover:text-amber-400">Clique p/ preencher</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}