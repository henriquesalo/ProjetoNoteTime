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
    servicosIds: [],
    data: '',
    horario: '',
    observacoes: ''
  });

  //  formatação automática de telefone
  const formatarTelefone = (valor) => {
    const nums = valor.replace(/\D/g, '').slice(0, 11);

    if (nums.length <= 10) {
      return nums
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }

    return nums
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const handleTelefoneChange = (e) => {
    setFormData({
      ...formData,
      clienteTelefone: formatarTelefone(e.target.value)
    });
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

  const toggleServico = (id) => {
    setFormData((prev) => ({
      ...prev,
      servicosIds: prev.servicosIds.includes(id)
        ? prev.servicosIds.filter((sid) => sid !== id)
        : [...prev.servicosIds, id]
    }));
  };

  const barbeiroSelecionado = barbeiros.find(
    (b) => b.id === formData.barbeiroId
  );

  const servicosSelecionados = servicos.filter((s) =>
    formData.servicosIds.includes(s.id)
  );

  const totalPreco = servicosSelecionados.reduce(
    (sum, s) => sum + (s.preco || 0),
    0
  );

  const totalDuracao = servicosSelecionados.reduce(
    (sum, s) => sum + (s.duracaoMinutos || 0),
    0
  );

  const horariosDisponiveis = [
    '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30'
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-amber-500" />
          Novo Agendamento
        </h1>
        <p className="text-zinc-400">
          Preencha os dados para criar um novo agendamento
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Dados do Cliente */}
          <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
            <h2 className="text-xl font-bold text-white mb-4">
              Dados do Cliente
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome completo"
                value={formData.clienteNome}
                onChange={(e) =>
                  setFormData({ ...formData, clienteNome: e.target.value })
                }
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                required
              />

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.clienteEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, clienteEmail: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                  required
                />
                <input
                  type="tel"
                  placeholder="Telefone"
                  maxLength={15}
                  value={formData.clienteTelefone}
                  onChange={handleTelefoneChange}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Serviços */}
          <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
            <h2 className="text-xl font-bold text-white mb-4">Serviços</h2>

            <div className="space-y-3">
              {servicos.filter(s => s.ativo).map((servico) => {
                const selecionado =
                  formData.servicosIds.includes(servico.id);

                return (
                  <button
                    type="button"
                    key={servico.id}
                    onClick={() => toggleServico(servico.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg border ${selecionado
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-zinc-700 bg-zinc-900'
                      }`}
                  >
                    <div className="flex justify-between">
                      <span>{servico.nome}</span>
                      <span>
                        R$ {servico.preco?.toFixed(2)} •{' '}
                        {servico.duracaoMinutos} min
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Resumo */}
        <div>
          <div className="bg-amber-500 rounded-xl p-6 sticky top-6">
            <h2 className="text-xl font-bold text-white mb-4">Resumo</h2>

            <p className="text-white">
              Serviços: {servicosSelecionados.length}
            </p>
            <p className="text-white">
              Duração: {totalDuracao} min
            </p>
            <p className="text-white mb-4">
              Total: R$ {totalPreco.toFixed(2)}
            </p>

            <button
              type="submit"
              className="w-full bg-white text-amber-600 font-bold py-3 rounded-lg"
            >
              <CheckCircle className="inline mr-2" />
              Confirmar Agendamento
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
