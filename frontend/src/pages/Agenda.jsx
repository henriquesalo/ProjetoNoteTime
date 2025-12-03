import React, { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { agendamentosApi, barbeirosApi } from '../api/notetimeApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar as CalendarIcon, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Agenda() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [filtros, setFiltros] = useState({
    barbeiroId: "todos",
    status: "todos",
    dataInicial: format(currentWeek, 'yyyy-MM-dd'),
    dataFinal: format(addDays(currentWeek, 6), 'yyyy-MM-dd'),
    clienteNome: ""
  });

  const { data: agendamentos = [], isLoading } = useQuery({
    queryKey: ['agendamentos', filtros],
    queryFn: () => agendamentosApi.listar({
      barbeiroId: filtros.barbeiroId === "todos" ? undefined : filtros.barbeiroId,
      status: filtros.status === "todos" ? undefined : filtros.status,
      dataInicial: filtros.dataInicial,
      dataFinal: filtros.dataFinal,
      clienteNome: filtros.clienteNome
    })
  });

  const { data: barbeiros = [] } = useQuery({
    queryKey: ['barbeiros'],
    queryFn: barbeirosApi.listar
  });

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i)), [currentWeek]);

  const getAgendamentosDoDia = useCallback((dia) => {
    return agendamentos.filter(a => 
      isSameDay(new Date(a.data), dia)
    ).sort((a, b) => a.horario.localeCompare(b.horario));
  }, [agendamentos]);

  const alterarStatusMutation = useMutation({
    mutationFn: ({ id, status }) => agendamentosApi.alterarStatus(id, status),
    onSuccess: () => {
      setSelectedId(null);
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
    },
    onError: (error) => {
      console.error("Erro ao alterar status:", error);
      alert("Erro ao alterar status do agendamento.");
    }
  });

  const handleAlterarStatus = (id, novoStatus) => {
    if (confirm(`Tem certeza que deseja alterar o status para ${novoStatus}?`)) {
      alterarStatusMutation.mutate({ id, status: novoStatus });
    }
  };

  const handleWeekChange = (novaSemana) => {
    setCurrentWeek(novaSemana);
    setFiltros(prev => ({
      ...prev,
      dataInicial: format(novaSemana, 'yyyy-MM-dd'),
      dataFinal: format(addDays(novaSemana, 6), 'yyyy-MM-dd'),
    }));
  };

  const statusColors = {
    scheduled: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    confirmed: "bg-green-500/20 text-green-400 border-green-500/30",
    present: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    absent: "bg-red-500/20 text-red-400 border-red-500/30",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
    completed: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  };

  const statusLabels = {
    scheduled: "Agendado",
    confirmed: "Confirmado",
    present: "Presente",
    absent: "Ausente",
    cancelled: "Cancelado",
    completed: "Concluído",
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-amber-500" />
              Agenda
            </h1>
            <p className="text-zinc-400">Gerencie todos os agendamentos</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filtros.barbeiroId}
              onChange={(e) => setFiltros(prev => ({ ...prev, barbeiroId: e.target.value }))}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg"
            >
              <option value="todos">Todos os Barbeiros</option>
              {barbeiros.map(barbeiro => (
                <option key={barbeiro.id} value={barbeiro.id}>
                  {barbeiro.nome}
                </option>
              ))}
            </select>

            <select
              value={filtros.status}
              onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg"
            >
              <option value="todos">Todos os Status</option>
              {Object.keys(statusLabels).map(status => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Nome do Cliente"
              value={filtros.clienteNome}
              onChange={(e) => setFiltros(prev => ({ ...prev, clienteNome: e.target.value }))}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg placeholder-zinc-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => handleWeekChange(subWeeks(currentWeek, 1))}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl font-semibold text-white">
            {format(currentWeek, "MMMM yyyy", { locale: ptBR })}
          </h2>

          <button
            onClick={() => handleWeekChange(addWeeks(currentWeek, 1))}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((dia, index) => {
          const agendamentosDia = getAgendamentosDoDia(dia);
          const isHoje = isSameDay(dia, new Date());

          return (
            <div key={index}>
              <div className={`bg-zinc-800 rounded-xl border ${isHoje ? 'ring-2 ring-amber-500 border-amber-500' : 'border-zinc-700'}`}>
                <div className={`border-b p-4 ${isHoje ? 'bg-amber-500/10 border-amber-500/30' : 'border-zinc-700'}`}>
                  <div className="text-center">
                    <div className="text-zinc-400 text-xs uppercase mb-1">
                      {format(dia, "EEE", { locale: ptBR })}
                    </div>
                    <div className={`text-2xl font-bold ${isHoje ? 'text-amber-500' : 'text-white'}`}>
                      {format(dia, "dd")}
                    </div>
                  </div>
                </div>
                <div className="p-3 space-y-2 min-h-[300px] max-h-[500px] overflow-y-auto">
                  {agendamentosDia.length === 0 ? (
                    <div className="text-center text-zinc-500 text-sm py-8">
                      Sem agendamentos
                    </div>
                  ) : (
                    agendamentosDia.map((agendamento) => (
                      <div
                        key={agendamento.id}
                        className={`p-3 bg-zinc-900 rounded-lg border transition-all ${selectedId === agendamento.id ? 'border-amber-500' : 'border-zinc-700 hover:border-amber-500/50'}`}
                        onClick={() => setSelectedId(prev => prev === agendamento.id ? null : agendamento.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-amber-500">
                            {agendamento.horario}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${statusColors[agendamento.status]}`}>
                            {statusLabels[agendamento.status] || agendamento.status}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-white mb-1">
                          {agendamento.clienteNome}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {agendamento.barbeiroNome}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {agendamento.servicoNome}
                        </p>
                        {selectedId === agendamento.id && (
                          <div className="mt-3 pt-3 border-t border-zinc-800 flex flex-wrap gap-2">
                            {Object.keys(statusLabels).filter(s => s !== agendamento.status).map(status => (
                              <button
                                key={status}
                                onClick={(e) => { e.stopPropagation(); handleAlterarStatus(agendamento.id, status); }}
                                className="text-xs px-2 py-1 rounded bg-zinc-700 text-white hover:bg-amber-500 transition-colors"
                                disabled={alterarStatusMutation.isPending}
                              >
                                {statusLabels[status]}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
