import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

const statusColors = {
  pendente: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  confirmado: "bg-green-500/20 text-green-400 border-green-500/30",
  em_andamento: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  concluido: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  cancelado: "bg-red-500/20 text-red-400 border-red-500/30",
};

const statusLabels = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  em_andamento: "Em Andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export default function ProximosAgendamentos({ agendamentos }) {
  return (
    <Card className="bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700">
      <CardHeader className="border-b border-zinc-700">
        <CardTitle className="text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-500" />
          Próximos Agendamentos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {agendamentos.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              Nenhum agendamento próximo
            </div>
          ) : (
            agendamentos.map((agendamento, index) => (
              <motion.div
                key={agendamento.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 hover:border-amber-500/50 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-500" />
                    <span className="font-semibold text-white">{agendamento.cliente_nome}</span>
                  </div>
                  <Badge className={statusColors[agendamento.status]}>
                    {statusLabels[agendamento.status]}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>{format(new Date(agendamento.data), "dd/MM/yyyy", { locale: ptBR })} às {agendamento.horario}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3" />
                    <span>Barbeiro: {agendamento.barbeiro_nome}</span>
                  </div>
                  <div className="text-amber-400 font-medium">
                    {agendamento.servico_nome} - R$ {agendamento.preco?.toFixed(2)}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}