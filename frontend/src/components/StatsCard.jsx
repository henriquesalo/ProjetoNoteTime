import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function StatsCard({ title, value, icon: Icon, trend, bgGradient }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700 hover:border-amber-500/50 transition-all duration-300 overflow-hidden group">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-zinc-400 text-sm font-medium">{title}</p>
              <p className="text-3xl font-bold text-white">{value}</p>
              {trend && (
                <p className="text-sm text-amber-500 font-medium">{trend}</p>
              )}
            </div>
            <div className={`p-4 rounded-xl bg-gradient-to-br ${bgGradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}