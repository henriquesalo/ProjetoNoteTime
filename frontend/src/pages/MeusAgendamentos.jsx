import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agendamentosApi } from '../api/notetimeApi';
import { Calendar, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function MeusAgendamentos() {
  const queryClient = useQueryClient();
  const [filtro, setFiltro] = useState('todos');

  const { data: agendamentos = [] } = useQuery({
    queryKey: ['agendamentos'],
    queryFn: agendamentosApi.listar
  });

  const confirmarAgendamento = useMutation({
    mutationFn: (id) => agendamentosApi.confirmar(id),
    onSuccess: () => queryClient.invalidateQueries(['agendamentos'])
  });

  const cancelarAgendamento = useMutation({
    mutationFn: (id) => agendamentosApi.cancelar(id),
    onSuccess: () => queryClient.invalidateQueries(['agendamentos'])
  });

  const statusColors = {
    scheduled: "bg-yellow-500/20 text-yellow-400",
    confirmed: "bg-green-500/20 text-green-400",
    present: "bg-blue-500/20 text-blue-400",
    completed: "bg-purple-500/20 text-purple-400",
    cancelled: "bg-red-500/20 text-red-400",
  };

  const statusLabels = {
    scheduled: "Agendado",
    confirmed: "Confirmado",
    present: "Presente",
    absent: "Ausente",
    completed: "Concluído",
    cancelled: "Cancelado",
  };

  const agendamentosFiltrados = agendamentos.filter(a => {
    if (filtro === 'todos') return true;
    return a.status === filtro;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-amber-500" />
          Meus Agendamentos
        </h1>
        <p className="text-zinc-400">Gerencie seus agendamentos</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['todos', 'scheduled', 'confirmed', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFiltro(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filtro === status
                ? 'bg-amber-500 text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {status === 'todos' ? 'Todos' : (statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1))}
          </button>
        ))}
      </div>

      {/* Lista de Agendamentos */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agendamentosFiltrados.map((agendamento) => (
          <div key={agendamento.id} className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[agendamento.status]}`}>
                {statusLabels[agendamento.status] || agendamento.status}
              </span>
              <div className="text-right">
                <p className="text-amber-500 font-bold text-lg">
                  R$ {agendamento.preco?.toFixed(2)}
                </p>
                <p className="text-xs text-zinc-500">{agendamento.duracaoMinutos} min</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-white">
                <User className="w-4 h-4 text-amber-500" />
                <span className="font-semibold">{agendamento.clienteNome}</span>
              </div>
              
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(agendamento.data), "dd/MM/yyyy", { locale: ptBR })}</span>
              </div>
              
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <Clock className="w-4 h-4" />
                <span>{agendamento.horario}</span>
              </div>

              <div className="pt-3 border-t border-zinc-700">
                <p className="text-sm text-zinc-400 mb-1">Serviço</p>
                <p className="text-white font-medium">{agendamento.servicoNome}</p>
              </div>

              <div>
                <p className="text-sm text-zinc-400 mb-1">Barbeiro</p>
                <p className="text-white font-medium">{agendamento.barbeiroNome}</p>
              </div>
            </div>

            {agendamento.status === "scheduled" && (
              <div className="flex gap-2">
                <button
                  onClick={() => confirmarAgendamento.mutate(agendamento.id)}
                  disabled={confirmarAgendamento.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirmar
                </button>
                <button
                  onClick={() => cancelarAgendamento.mutate(agendamento.id)}
                  disabled={cancelarAgendamento.isPending}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Cancelar
                </button>
              </div>
            )}

            {agendamento.status === "confirmed" && (
              <button
                onClick={() => cancelarAgendamento.mutate(agendamento.id)}
                disabled={cancelarAgendamento.isPending}
                className="w-full bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded-lg transition-colors"
              >
                Cancelar Agendamento
              </button>
            )}
          </div>
        ))}

        {agendamentosFiltrados.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Calendar className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg">Nenhum agendamento encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
