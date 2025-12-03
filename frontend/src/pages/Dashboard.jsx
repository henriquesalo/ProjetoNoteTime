import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { agendamentosApi, barbeirosApi } from '../api/notetimeApi';
import { Calendar, DollarSign, Users, Clock, TrendingUp, User } from 'lucide-react';
import { startOfMonth, endOfMonth, isToday, isFuture, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
    isToday(new Date(a.data)) && a.status !== 'cancelled'
  );

  const proximosAgendamentos = agendamentos
    .filter(a => isFuture(new Date(a.data)) && a.status !== 'cancelled')
    .sort((a, b) => new Date(a.data) - new Date(b.data))
    .slice(0, 5);

  const receitaMes = agendamentos
    .filter(a => {
      const dataAgendamento = new Date(a.data);
      return dataAgendamento >= inicioMes && 
             dataAgendamento <= fimMes && 
             a.status === 'completed';
    })
    .reduce((sum, a) => sum + (a.preco || 0), 0);

  const stats = [
    { 
      title: 'Agendamentos Hoje', 
      value: agendamentosHoje.length, 
      icon: Calendar, 
      color: 'from-blue-500 to-blue-600',
      description: 'Compromissos para o dia' 
    },
    { 
      title: 'Próximos', 
      value: proximosAgendamentos.length, 
      icon: Clock, 
      color: 'from-amber-500 to-amber-600',
      description: 'Total de futuros agendamentos'
    },
    { 
      title: 'Receita do Mês', 
      value: `R$ ${receitaMes.toFixed(2)}`, 
      icon: DollarSign, 
      color: 'from-green-500 to-green-600',
      description: 'Faturamento de serviços concluídos'
    },
    { 
      title: 'Barbeiros Ativos', 
      value: barbeiros.filter(b => b.ativo).length, 
      icon: Users, 
      color: 'from-purple-500 to-purple-600',
      description: 'Profissionais na equipe'
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-amber-500" />
            Dashboard
        </h1>
        <p className="text-zinc-400">Visão geral e métricas de desempenho da sua barbearia</p>
      </div><br />

      {/* Cartões de Estatísticas */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="bg-zinc-900/60 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/5 transition-all hover:border-amber-500/30"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider">{stat.title}</p>
              <div className={`p-2 rounded-full bg-gradient-to-br ${stat.color} text-white shadow-lg shadow-black/30`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-4xl font-extrabold text-white mb-1">
              {stat.value}
            </p>
            <p className="text-xs text-zinc-500">{stat.description}</p>
          </div>
        ))}
      </div><br />

      {/* Próximos Agendamentos */}
      <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/5">
        <h2 className="text-xl font-bold text-white mb-6 border-b border-zinc-800 pb-3">Próximos Agendamentos</h2><br />
        {proximosAgendamentos.length === 0 ? (
          <p className="text-zinc-400 text-center py-8">Nenhum agendamento próximo.</p>
        ) : (
          <div className="space-y-4">
            {proximosAgendamentos.map((agendamento) => (
              <div key={agendamento.id} className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800 transition-all hover:border-amber-500/50">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white text-lg">{agendamento.clienteNome}</p>
                    <p className="text-sm text-zinc-400">{agendamento.servicoNome}</p>
                    <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                        <User className='w-3 h-3'/> {agendamento.barbeiroNome}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='text-white font-semibold'>
                        {format(new Date(agendamento.data), 'dd/MM', { locale: ptBR })} às {agendamento.horario}
                    </p>
                    <span className={`px-3 py-1 mt-1 rounded-full text-xs font-medium inline-block border ${
                      agendamento.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      agendamento.status === 'scheduled' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      'bg-zinc-600/20 text-zinc-400 border-zinc-600/30'
                    }`}>
                      {agendamento.status === 'confirmed' ? 'Confirmado' : 'Agendado'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}