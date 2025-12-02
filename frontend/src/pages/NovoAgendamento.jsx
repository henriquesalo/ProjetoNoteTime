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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Calendar className="w-6 h-6 text-amber-500" />
        Novo agendamento
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid lg:grid-cols-[2fr,1fr] gap-6 items-start"
      >
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
            <h2 className="text-lg font-semibold text-white mb-2">
              Dados do cliente
            </h2>

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
              />

              <input
                type="text"
                placeholder="Telefone"
                value={formData.clienteTelefone}
                onChange={handleTelefoneChange}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
              />
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
            <h2 className="text-lg font-semibold text-white mb-2">
              Detalhes do agendamento
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="date"
                value={formData.data}
                onChange={(e) =>
                  setFormData({ ...formData, data: e.target.value })
                }
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                required
              />

              <input
                type="time"
                value={formData.horario}
                onChange={(e) =>
                  setFormData({ ...formData, horario: e.target.value })
                }
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                required
              />
            </div>

            <select
              value={formData.barbeiroId}
              onChange={(e) =>
                setFormData({ ...formData, barbeiroId: e.target.value })
              }
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
              required
            >
              <option value="">Selecione um barbeiro</option>
              {barbeiros.map((barbeiro) => (
                <option key={barbeiro.id} value={barbeiro.id}>
                  {barbeiro.nome}
                </option>
              ))}
            </select>

            <textarea
              placeholder="Observações (opcional)"
              value={formData.observacoes}
              onChange={(e) =>
                setFormData({ ...formData, observacoes: e.target.value })
              }
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white min-h-[80px]"
            />
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
            <h2 className="text-lg font-semibold text-white mb-2">
              Serviços
            </h2>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {servicos.map((servico) => {
                const selecionado = formData.servicosIds.includes(servico.id);

                return (
                  <button
                    key={servico.id}
                    type="button"
                    onClick={() => toggleServico(servico.id)}
                    className={
                      'w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left ' +
                      (selecionado
                        ? 'bg-amber-500/20 border-amber-500 text-white'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-200')
                    }
                  >
                    <div>
                      <p className="font-medium">{servico.nome}</p>
                      <p className="text-xs text-zinc-400">
                        {servico.duracaoMinutos} min
                      </p>
                    </div>
                    <span className="text-sm">
                      R$ {servico.preco?.toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

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

            {createAgendamento.isError && (
              <div className="text-sm text-red-400 mb-2">
                {createAgendamento.error?.response?.data?.error ||
                  'Erro ao criar agendamento'}
              </div>
            )}

            <button
              type="submit"
              disabled={createAgendamento.isPending}
              className="w-full bg-white text-amber-600 font-bold py-3 rounded-lg disabled:opacity-50"
            >
              <CheckCircle className="inline mr-2" />
              {createAgendamento.isPending ? 'Salvando...' : 'Confirmar Agendamento'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
