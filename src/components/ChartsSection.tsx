'use client';

import React, { useEffect, useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { CATEGORIES_CONFIG, TransactionCategory } from '@/types/finance';
import { formatCurrency } from '@/lib/formatters';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { PieChart as PieIcon, BarChart3 } from 'lucide-react';

export function ChartsSection() {
  const { categoryExpenses, monthlyTransactions } = useFinance();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-64 flex items-center justify-center text-gray-500">Carregando gráficos...</div>;
  }

  // Dados para o Gráfico de Despesas por Categoria
  const categoryData = Object.entries(categoryExpenses)
    .filter(([_, value]) => value > 0)
    .map(([catKey, value]) => {
      const config = CATEGORIES_CONFIG[catKey as TransactionCategory];
      return {
        name: config ? config.name : catKey,
        value,
        color: config ? config.color : '#8884d8',
      };
    })
    .sort((a, b) => b.value - a.value);

  // Dados para o Gráfico de Fontes/Bolsões (LIVRE vs VR vs RESERVA)
  const walletStats = {
    LIVRE: { income: 0, expense: 0 },
    BENEFICIO_VR_VA: { income: 0, expense: 0 },
    RESERVA_EMERGENCIA: { income: 0, expense: 0 },
  };

  for (const tx of monthlyTransactions) {
    if (tx.wallet in walletStats) {
      if (tx.type === 'income') {
        walletStats[tx.wallet].income += tx.amount;
      } else {
        walletStats[tx.wallet].expense += tx.amount;
      }
    }
  }

  const walletBarData = [
    {
      name: 'Saldo Livre',
      Entradas: walletStats.LIVRE.income,
      Saídas: walletStats.LIVRE.expense,
    },
    {
      name: 'Benefício VR/VA',
      Entradas: walletStats.BENEFICIO_VR_VA.income,
      Saídas: walletStats.BENEFICIO_VR_VA.expense,
    },
    {
      name: 'Reserva',
      Entradas: walletStats.RESERVA_EMERGENCIA.income,
      Saídas: walletStats.RESERVA_EMERGENCIA.expense,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Gráfico 1: Despesas por Categoria */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <PieIcon className="w-3.5 h-3.5 text-amber-400" />
            Despesas por Categoria
          </h3>
          <span className="text-xs text-gray-500">
            {categoryData.length} categorias com gastos
          </span>
        </div>

        {categoryData.length === 0 ? (
          <div className="h-60 flex items-center justify-center text-sm text-gray-500">
            Nenhuma despesa registrada neste mês.
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#111827" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [formatCurrency(val), 'Total']}
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#374151',
                    borderRadius: '0.75rem',
                    color: '#f3f4f6',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Legenda compacta das top categorias */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-gray-800/80">
          {categoryData.slice(0, 6).map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-xs truncate">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-300 truncate">{item.name}:</span>
              <span className="text-gray-400 font-semibold">{formatCurrency(item.value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico 2: Fluxo por Bolsão */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
            Fluxo de Entradas vs Saídas por Bolsão
          </h3>
          <span className="text-xs text-gray-500">Comparativo Mensal</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={walletBarData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#6b7280"
                fontSize={10}
                tickFormatter={(v: number) => `R$ ${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                tickLine={false}
              />
              <Tooltip
                formatter={(val: number) => [formatCurrency(val)]}
                contentStyle={{
                  backgroundColor: '#111827',
                  borderColor: '#374151',
                  borderRadius: '0.75rem',
                  color: '#f3f4f6',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="text-xs text-gray-400 text-center mt-2 pt-2 border-t border-gray-800/80">
          Mostra quanto entrou e saiu de cada bolsão neste mês.
        </div>
      </div>
    </div>
  );
}
