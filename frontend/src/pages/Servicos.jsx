import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicosApi } from '../api/notetimeApi';
import { Scissors, Plus, Clock, DollarSign, X } from 'lucide-react';

export default function Servicos() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: '', descricao: '', preco: '', duracaoMinutos: ''
  });

  const { data: servicos = [] } = useQuery({
    queryKey: ['servicos'],
    queryFn: servicosApi.listar
  });

  const criarServico = useMutation({
    mutationFn: (data) => servicosApi.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['servicos']);
      setShowModal(false);
      setFormData({ nome: '', descricao: '', preco: '', duracaoMinutos: '' });
    }
  });

  const toggleAtivo = useMutation({
    mutationFn: (id) => servicosApi.toggleAtivo(id),
    onSuccess: () => queryClient.invalidateQueries(['servicos'])
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Scissors className="w-8 h-8 text-amber-500" />
            Serviços
          </h1>
          <p className="text-zinc-400">Gerencie os serviços oferecidos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Serviço
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servicos.map((servico) => (
          <div key={servico.id} className="bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700">
            <div className="h-32 bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
              <Scissors className="w-16 h-16 text-amber-500/50" />
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-white">{servico.nome}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  servico.ativo ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {servico.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              {servico.descricao && (
                <p className="text-sm text-zinc-400 mb-4">{servico.descricao}</p>
              )}

              <div className="flex justify-between items-center py-3 border-t border-b border-zinc-700 mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <span className="text-xl font-bold text-white">
                    R$ {servico.preco?.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Clock className="w-4 h-4" />
                  <span>{servico.duracaoMinutos} min</span>
                </div>
              </div>

              <button
                onClick={() => toggleAtivo.mutate(servico.id)}
                className="w-full px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
              >
                {servico.ativo ? 'Desativar' : 'Ativar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Criar Serviço */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-md border border-zinc-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Novo Serviço</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); criarServico.mutate(formData); }} className="space-y-4">
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
                <label className="block text-zinc-300 mb-2 text-sm">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 mb-2 text-sm">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.preco}
                    onChange={(e) => setFormData({...formData, preco: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 mb-2 text-sm">Duração (min)</label>
                  <input
                    type="number"
                    value={formData.duracaoMinutos}
                    onChange={(e) => setFormData({...formData, duracaoMinutos: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={criarServico.isPending}
                className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {criarServico.isPending ? 'Salvando...' : 'Salvar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}