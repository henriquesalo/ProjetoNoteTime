import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agendamentosApi, barbeirosApi } from '../api/notetimeApi';
import { Calendar as CalendarIcon, Filter, ChevronLeft, ChevronRight, Search, RefreshCw } from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, subWeeks } from 'date-fns';
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

  const { data: agendamentos = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['agendamentos', filtros],
    queryFn: () => agendamentosApi.listar({
      barbeiroId: filtros.barbeiroId === "todos" ? undefined : filtros.barbeiroId,
      status: filtros.status === "todos" ? undefined : filtros.status,
      dataInicial: filtros.dataInicial,
      dataFinal: filtros.dataFinal,
      clienteNome: filtros.clienteNome
    }),
    staleTime: 0,
    refetchOnWindowFocus: true
  });

  const { data: barbeiros = [] } = useQuery({
    queryKey: ['barbeiros'],
    queryFn: barbeirosApi.listar
  });

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i)), [currentWeek]);

  const getAgendamentosDoDia = useCallback((diaColuna) => {
    const diaColunaString = format(diaColuna, 'yyyy-MM-dd');

    return agendamentos.filter(a => {
      const dataAgendamentoString = format(new Date(a.data), 'yyyy-MM-dd');
      return dataAgendamentoString === diaColunaString;
    }).sort((a, b) => a.horario.localeCompare(b.horario));
  }, [agendamentos]);

  const alterarStatusMutation = useMutation({
    mutationFn: ({ id, status }) => agendamentosApi.alterarStatus(id, status),
    onSuccess: () => {
      setSelectedId(null);
      queryClient.invalidateQueries({ queryKey: ['agendamentos'], exact: false });
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
    scheduled: "Agendado", confirmed: "Confirmado", present: "Presente",
    absent: "Ausente", cancelled: "Cancelado", completed: "Concluído",
  };

  const getStatusLabel = (status) => statusLabels[status] || status;
  const inputStyle = "w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all";
  const actionButtonStyle = (isPending) => `text-xs px-2 py-1 rounded bg-zinc-700 text-white hover:bg-amber-500 transition-colors ${isPending ? 'opacity-50 cursor-wait' : ''}`;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-amber-500" />
            Agenda Semanal
          </h1>
          <p className="text-zinc-400">Visão completa dos agendamentos por dia e barbeiro</p>
        </div>
      </div>

      {/* Navegação e Filtros */}
      <div className="bg-zinc-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/5 mb-8">
        
        {/* Navegação Semanal */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => handleWeekChange(subWeeks(currentWeek, 1))} className="p-3 rounded-full text-zinc-400 hover:bg-zinc-700 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold text-white">
            {format(currentWeek, 'dd/MM/yyyy', { locale: ptBR })} - {format(addDays(currentWeek, 6), 'dd/MM/yyyy', { locale: ptBR })}
          </h2>
          <button onClick={() => handleWeekChange(addWeeks(currentWeek, 1))} className="p-3 rounded-full text-zinc-400 hover:bg-zinc-700 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="relative">
            <Filter className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 mt-1.5 pointer-events-none" />
            <select value={filtros.barbeiroId} onChange={(e) => setFiltros(prev => ({ ...prev, barbeiroId: e.target.value }))} className={`${inputStyle} pl-10`}>
              <option value="todos">Todos os Barbeiros</option>
              {barbeiros.map(barbeiro => <option key={barbeiro.id} value={barbeiro.id}>{barbeiro.nome}</option>)}
            </select>
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 mt-1.5 pointer-events-none" />
            <select value={filtros.status} onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))} className={`${inputStyle} pl-10`}>
              <option value="todos">Todos os Status</option>
              {Object.keys(statusLabels).map(status => <option key={status} value={status}>{statusLabels[status]}</option>)}
            </select>
          </div>
          
          <div className="relative md:col-span-2 flex gap-2">
            <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 mt-1.5 pointer-events-none" />
                <input type="text" placeholder="Nome do Cliente" value={filtros.clienteNome} onChange={(e) => setFiltros(prev => ({ ...prev, clienteNome: e.target.value }))} className={`${inputStyle} pl-10`} />
            </div>
            <button onClick={() => refetch()} className="px-4 py-3 bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700 rounded-xl transition-colors flex items-center justify-center gap-2" disabled={isRefetching} title="Atualizar Agendamentos">
                <RefreshCw className={`w-5 h-5 ${isRefetching ? 'animate-spin text-amber-500' : 'text-zinc-400'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Estrutura da Agenda */}
      {isLoading ? (
        <div className="text-center py-10 text-zinc-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Carregando agenda...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {weekDays.map((dia) => {
            // Se o dia for 06/12, a string será "2025-12-06", e só agendamentos com essa string entrarão aqui
            const agendamentosDoDia = getAgendamentosDoDia(dia);
            
            // Corrige a verificação visual de "Hoje" também para string, para evitar bugs visuais
            const isToday = format(dia, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

            return (
              <div
                key={dia.toISOString()}
                className={`flex flex-col min-h-[300px] border-l border-zinc-800 ${isToday ? 'lg:border-l-2 border-amber-500' : ''}`}
              >
                {/* Cabeçalho do Dia */}
                <div className={`p-3 text-center sticky top-0 z-10 ${isToday ? 'bg-amber-500/10' : 'bg-zinc-900/50 backdrop-blur-md border-b border-zinc-800'}`}>
                  <p className={`text-xs font-semibold uppercase ${isToday ? 'text-amber-400' : 'text-zinc-400'}`}>
                    {format(dia, 'eee', { locale: ptBR })}
                  </p>
                  <p className={`text-2xl font-bold ${isToday ? 'text-white' : 'text-zinc-300'}`}>
                    {format(dia, 'dd')}
                  </p>
                </div>

                {/* Lista de Agendamentos */}
                <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                  {agendamentosDoDia.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center mt-4">Livre</p>
                  ) : (
                    agendamentosDoDia.map((agendamento) => (
                      <div
                        key={agendamento.id}
                        className={`p-3 rounded-xl cursor-pointer transition-all border ${
                          selectedId === agendamento.id
                            ? 'bg-amber-500/10 border-amber-500/50 ring-2 ring-amber-500/20'
                            : 'bg-zinc-800/80 border-zinc-700/50 hover:bg-zinc-800'
                        }`}
                        onClick={() => setSelectedId(agendamento.id === selectedId ? null : agendamento.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-semibold text-white">{agendamento.horario}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusColors[agendamento.status]}`}>
                            {getStatusLabel(agendamento.status)}
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
                                className={actionButtonStyle(alterarStatusMutation.isPending)}
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
            );
          })}
        </div>
      )}
    </div>
  );
}