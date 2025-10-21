import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scissors, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      setError(err.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-8 rounded-2xl shadow-2xl border border-zinc-700">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Scissors className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Título */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">NoteTime</h1>
            <p className="text-zinc-400">Sistema de Gestão de Barbearia</p>
          </div>

          {/* Erro */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-zinc-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-zinc-900 border-zinc-700 text-white mt-2"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="senha" className="text-zinc-300">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                className="bg-zinc-900 border-zinc-700 text-white mt-2"
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-6 text-lg"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Credenciais de teste */}
          <div className="mt-6 p-4 bg-zinc-900 rounded-lg border border-zinc-700">
            <p className="text-xs text-zinc-500 mb-2">Credenciais de teste:</p>
            <p className="text-xs text-zinc-400">
              <strong>Admin:</strong> admin@notetime.com / Admin@123456
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              <strong>Barbeiro:</strong> joao@notetime.com / Barber@123456
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}