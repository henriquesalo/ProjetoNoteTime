import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agendamentosApi, barbeirosApi, servicosApi } from '../api/notetimeApi';
import { Calendar, CheckCircle } from 'lucide-react';

export default function NovoAgendamento() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    clienteNome: '',
    clienteEmail: '',
    clienteTelefone: '',
    barbeiroId: '',
    servicoId: '',
    data: '',
    horario: '',
    observacoes: ''
  });
  //formartar telefone 
  const formatarTelefone = (valor) => {
    const apenasNums = valor.replace(/\D/g, "");

    if (apenasNums.length <= 10) {
      return apenasNums
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }

    return apenasNums
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  };
 
  const { data: barbeiros = [] } = useQuery({
    queryKey: ['barbeiros'],
    queryFn: barbeirosApi.listar
  });

  const { data: servicos = [] } = useQuery({
    queryKey: ['servicos'],
    queryFn: servicosApi.listar
  });

  const createAgendamento = useMutation({
    mutationFn: (data) => agendamentosApi.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['agendamentos']);
      navigate('/meus-agendamentos');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createAgendamento.mutate(formData);
  };

  const barbeiroSelecionado = barbeiros.find(b => b.id === formData.barbeiroId);
  const servicoSelecionado = servicos.find(s => s.id === formData.servicoId);

  const horariosDisponiveis = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30"
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-amber-500" />
          Novo Agendamento
        </h1>
        <p className="text-zinc-400">Preencha os dados para criar um novo agendamento</p>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Dados do Cliente */}
          <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
            <h2 className="text-xl font-bold text-white mb-4">Dados do Cliente</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-zinc-300 mb-2 text-sm">Nome Completo</label>
                <input
                  type="text"
                  value={formData.clienteNome}
                  onChange={(e) => setFormData({ ...formData, clienteNome: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 mb-2 text-sm">Email</label>
                  <input
                    type="email"
                    value={formData.clienteEmail}
                    onChange={(e) => setFormData({ ...formData, clienteEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 mb-2 text-sm">Telefone</label>
                  <input
                    type="tel"
                    value={formData.clienteTelefone}
                    maxLength={15}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        clienteTelefone: formatarTelefone(e.target.value)
                      })
                    }
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Serviço e Profissional */}
          <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
            <h2 className="text-xl font-bold text-white mb-4">Serviço e Profissional</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-zinc-300 mb-2 text-sm">Serviço</label>
                <select
                  value={formData.servicoId}
                  onChange={(e) => setFormData({ ...formData, servicoId: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                  required
                >
                  <option value="">Selecione um serviço</option>
                  {servicos.filter(s => s.ativo).map(servico => (
                    <option key={servico.id} value={servico.id}>
                      {servico.nome} - R$ {servico.preco?.toFixed(2)} ({servico.duracaoMinutos}min)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 mb-2 text-sm">Barbeiro</label>
                <select
                  value={formData.barbeiroId}
                  onChange={(e) => setFormData({ ...formData, barbeiroId: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                  required
                >
                  <option value="">Selecione um barbeiro</option>
                  {barbeiros.filter(b => b.ativo).map(barbeiro => (
                    <option key={barbeiro.id} value={barbeiro.id}>
                      {barbeiro.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Data e Horário */}
          <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
            <h2 className="text-xl font-bold text-white mb-4">Data e Horário</h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 mb-2 text-sm">Data</label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 mb-2 text-sm">Horário</label>
                  <select
                    value={formData.horario}
                    onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                    required
                  >
                    <option value="">Selecione o horário</option>
                    {horariosDisponiveis.map(horario => (
                      <option key={horario} value={horario}>{horario}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-2 text-sm">Observações</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                  rows="3"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Resumo */}
        <div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 sticky top-6">
            <h2 className="text-xl font-bold text-white mb-4">Resumo</h2>

            {servicoSelecionado && (
              <div className="space-y-3 text-white mb-6">
                <div>
                  <p className="text-sm text-white/80">Serviço</p>
                  <p className="font-semibold">{servicoSelecionado.nome}</p>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-white/80">Duração</span>
                  <span className="font-semibold">{servicoSelecionado.duracaoMinutos} min</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-white/20">
                  <span className="text-sm text-white/80">Valor</span>
                  <span className="font-semibold">R$ {servicoSelecionado.preco?.toFixed(2)}</span>
                </div>
              </div>
            )}

            {barbeiroSelecionado && (
              <div className="mb-4">
                <p className="text-sm text-white/80">Barbeiro</p>
                <p className="font-semibold text-white">{barbeiroSelecionado.nome}</p>
              </div>
            )}

            {formData.data && formData.horario && (
              <div className="mb-6">
                <p className="text-sm text-white/80">Data e Hora</p>
                <p className="font-semibold text-white">
                  {new Date(formData.data).toLocaleDateString('pt-BR')} às {formData.horario}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={createAgendamento.isPending}
              className="w-full bg-white text-amber-600 hover:bg-white/90 font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {createAgendamento.isPending ? (
                'Agendando...'
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Confirmar Agendamento
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}