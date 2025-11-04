import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { agendamentosApi, barbeirosApi } from '../api/notetimeApi';
import { Calendar, DollarSign, Users, Clock } from 'lucide-react';
import { startOfMonth, endOfMonth, isToday, isFuture } from 'date-fns';

export default function Dashboard() {
  const { data: agendamentos = [] } = useQuery({
    queryKey: ['agendamentos'],
    queryFn: agendamentosApi.listar
  });

  const { data: barbeiros = [] } = useQuery({
    queryKey: ['barbeiros'],
    queryFn: barbeirosApi.listar
  });

  const hoje = new Date();
  const inicioMes = startOfMonth(hoje);
  const fimMes = endOfMonth(hoje);

  const agendamentosHoje = agendamentos.filter(a => 
    isToday(new Date(a.data)) && a.status !== 'cancelado'
  );

  const proximosAgendamentos = agendamentos
    .filter(a => isFuture(new Date(a.data)) && a.status !== 'cancelado')
    .slice(0, 5);

  const receitaMes = agendamentos
    .filter(a => {
      const dataAgendamento = new Date(a.data);
      return dataAgendamento >= inicioMes && 
             dataAgendamento <= fimMes && 
             a.status === 'concluido';
    })
    .reduce((sum, a) => sum + (a.preco || 0), 0);

  const stats = [
    { title: 'Agendamentos Hoje', value: agendamentosHoje.length, icon: Calendar, color: 'from-blue-500 to-blue-600' },
    { title: 'Próximos', value: proximosAgendamentos.length, icon: Clock, color: 'from-amber-500 to-amber-600' },
    { title: 'Receita do Mês', value: `R$ ${receitaMes.toFixed(2)}`, icon: DollarSign, color: 'from-green-500 to-green-600' },
    { title: 'Barbeiros Ativos', value: barbeiros.filter(b => b.ativo).length, icon: Users, color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-zinc-400">Visão geral do seu negócio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-zinc-400 text-sm mb-2">{stat.title}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lista de próximos agendamentos */}
      <div className="mt-8 bg-zinc-800 rounded-xl p-6 border border-zinc-700">
        <h2 className="text-xl font-bold text-white mb-4">Próximos Agendamentos</h2>
        {proximosAgendamentos.length === 0 ? (
          <p className="text-zinc-400 text-center py-8">Nenhum agendamento próximo</p>
        ) : (
          <div className="space-y-3">
            {proximosAgendamentos.map((agendamento) => (
              <div key={agendamento.id} className="p-4 bg-zinc-900 rounded-lg border border-zinc-700">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-white">{agendamento.clienteNome}</p>
                    <p className="text-sm text-zinc-400">{agendamento.servicoNome}</p>
                    <p className="text-sm text-zinc-500 mt-1">
                      {new Date(agendamento.data).toLocaleDateString()} às {agendamento.horario}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    agendamento.status === 'confirmado' ? 'bg-green-500/20 text-green-400' :
                    agendamento.status === 'pendente' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {agendamento.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}