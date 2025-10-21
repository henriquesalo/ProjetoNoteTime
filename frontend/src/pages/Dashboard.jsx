import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Calendar, CheckCircle, Clock, DollarSign, Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { startOfMonth, endOfMonth, isToday, isFuture, isPast } from "date-fns";

import StatsCard from "../components/dashboard/StatsCard";
import ProximosAgendamentos from "../components/dashboard/ProximosAgendamentos";

export default function Dashboard() {
  const { data: agendamentos = [], isLoading } = useQuery({
    queryKey: ['agendamentos'],
    queryFn: () => base44.entities.Agendamento.list("-data"),
  });

  const { data: barbeiros = [] } = useQuery({
    queryKey: ['barbeiros'],
    queryFn: () => base44.entities.Barbeiro.list(),
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

  const agendamentosPendentes = agendamentos.filter(a => 
    a.status === 'pendente' && isFuture(new Date(a.data))
  );

  const receitaMes = agendamentos
    .filter(a => {
      const dataAgendamento = new Date(a.data);
      return dataAgendamento >= inicioMes && 
             dataAgendamento <= fimMes && 
             a.status === 'concluido';
    })
    .reduce((sum, a) => sum + (a.preco || 0), 0);

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-zinc-400">Visão geral do seu negócio</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Agendamentos Hoje"
          value={agendamentosHoje.length}
          icon={Calendar}
          trend={`${agendamentosPendentes.length} pendentes`}
          bgGradient="from-blue-500 to-blue-600"
        />
        <StatsCard
          title="Próximos Agendamentos"
          value={proximosAgendamentos.length}
          icon={Clock}
          trend="Confirmados"
          bgGradient="from-amber-500 to-amber-600"
        />
        <StatsCard
          title="Receita do Mês"
          value={`R$ ${receitaMes.toFixed(2)}`}
          icon={DollarSign}
          trend="+12% vs mês anterior"
          bgGradient="from-green-500 to-green-600"
        />
        <StatsCard
          title="Barbeiros Ativos"
          value={barbeiros.filter(b => b.ativo).length}
          icon={Users}
          trend={`${barbeiros.length} total`}
          bgGradient="from-purple-500 to-purple-600"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProximosAgendamentos agendamentos={proximosAgendamentos} />
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 shadow-xl shadow-amber-500/20"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-sm">Taxa de Ocupação</p>
                <p className="text-2xl font-bold text-white">87%</p>
              </div>
            </div>
            <p className="text-white/80 text-sm">
              Sua barbearia está com ótima ocupação este mês!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 rounded-xl p-6"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Ações Rápidas
            </h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-300 text-sm">
                Ver agendamentos pendentes ({agendamentosPendentes.length})
              </button>
              <button className="w-full text-left p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-300 text-sm">
                Gerenciar barbeiros ({barbeiros.length})
              </button>
              <button className="w-full text-left p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-300 text-sm">
                Relatório do mês
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}