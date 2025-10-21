import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { barbeirosApi } from '../api/notetimeApi';
import { Users, Plus, Phone, Mail, X } from 'lucide-react';

export default function Barbeiros() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: '', email: '', telefone: '', senha: '', especialidades: ''
  });

  const { data: barbeiros = [] } = useQuery({
    queryKey: ['barbeiros'],
    queryFn: barbeirosApi.listar
  });

  const criarBarbeiro = useMutation({
    mutationFn: (data) => barbeirosApi.criar({
      ...data,
      especialidades: data.especialidades.split(',').map(e => e.trim()).filter(Boolean)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['barbeiros']);
      setShowModal(false);
      setFormData({ nome: '', email: '', telefone: '', senha: '', especialidades: '' });
    }
  });

  const toggleAtivo = useMutation({
    mutationFn: (id) => barbeirosApi.toggleAtivo(id),
    onSuccess: () => queryClient.invalidateQueries(['barbeiros'])
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-amber-500" />
            Barbeiros
          </h1>
          <p className="text-zinc-400">Gerencie a equipe de profissionais</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Barbeiro
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {barbeiros.map((barbeiro) => (
          <div key={barbeiro.id} className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {barbeiro.nome.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{barbeiro.nome}</h3>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  barbeiro.ativo ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {barbeiro.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center gap-2 text-zinc-400">
                <Mail className="w-4 h-4" />
                <span>{barbeiro.email}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <Phone className="w-4 h-4" />
                <span>{barbeiro.telefone}</span>
              </div>
            </div>

            {barbeiro.especialidades && barbeiro.especialidades.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-zinc-500 mb-2">Especialidades:</p>
                <div className="flex flex-wrap gap-2">
                  {barbeiro.especialidades.map((esp, i) => (
                    <span key={i} className="px-2 py-1 bg-amber-500/10 text-amber-400 rounded text-xs">
                      {esp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => toggleAtivo.mutate(barbeiro.id)}
              className="w-full px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
            >
              {barbeiro.ativo ? 'Desativar' : 'Ativar'}
            </button>
          </div>
        ))}
      </div>

      {/* Modal Criar Barbeiro */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-md border border-zinc-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Novo Barbeiro</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); criarBarbeiro.mutate(formData); }} className="space-y-4">
              <div>
                <label className="block text-zinc-300 mb-2 text-sm">Nome</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-2 text-sm">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-2 text-sm">Telefone</label>
                <input
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-2 text-sm">Senha</label>
                <input
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({...formData, senha: e.target.value})}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-2 text-sm">Especialidades (separadas por vírgula)</label>
                <input
                  type="text"
                  value={formData.especialidades}
                  onChange={(e) => setFormData({...formData, especialidades: e.target.value})}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                  placeholder="Corte, Barba, Sobrancelha"
                />
              </div>

              <button
                type="submit"
                disabled={criarBarbeiro.isPending}
                className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {criarBarbeiro.isPending ? 'Salvando...' : 'Salvar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}