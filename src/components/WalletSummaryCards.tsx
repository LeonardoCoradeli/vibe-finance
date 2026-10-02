'use client';

import React from 'react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/lib/formatters';
import {
  Wallet,
  Utensils,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export function WalletSummaryCards() {
  const { balances, monthlyIncome, monthlyExpense, netSavings } = useFinance();

  return (
    <div className="space-y-4">
      {/* Bolsões de Saldo Segregados */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            Bolsões de Saldo & Regras de Segregação
          </h2>
          <span className="text-xs text-gray-500">
            Saldo Total: <strong className="text-gray-200">{formatCurrency(balances.total)}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Saldo Livre */}
          <div className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-[#0e1726] border border-blue-500/30 rounded-2xl p-4 shadow-lg shadow-blue-500/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Bolsão Livre
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold tracking-tight text-white">
                {formatCurrency(balances.livre)}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-300/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Disponível para pagar contas, boletos e lazer.</span>
              </div>
            </div>
          </div>

          {/* Card 2: Benefício VR / VA */}
          <div className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-[#1f1a10] border border-amber-500/30 rounded-2xl p-4 shadow-lg shadow-amber-500/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Benefício VR / VA
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Utensils className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold tracking-tight text-amber-300">
                {formatCurrency(balances.beneficioVrVa)}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-400/90 font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Exclusivo p/ alimentação. Não paga contas!</span>
              </div>
            </div>
          </div>

          {/* Card 3: Reserva Protegida */}
          <div className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-[#171026] border border-purple-500/30 rounded-2xl p-4 shadow-lg shadow-purple-500/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Reserva de Emergência
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold tracking-tight text-purple-300">
                {formatCurrency(balances.reserva)}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-purple-300/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Saldo protegido contra despesas do dia a dia.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas de Desempenho do Mês */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {/* Entradas do Mês */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Entradas do Mês</p>
            <p className="text-lg font-bold text-emerald-400 mt-0.5">
              {formatCurrency(monthlyIncome)}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        {/* Saídas do Mês */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Saídas do Mês</p>
            <p className="text-lg font-bold text-red-400 mt-0.5">
              {formatCurrency(monthlyExpense)}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>

        {/* Saldo Líquido do Mês */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Economia Líquida</p>
            <p
              className={`text-lg font-bold mt-0.5 ${
                netSavings >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {formatCurrency(netSavings)}
            </p>
          </div>
          <div
            className={`p-2 rounded-lg ${
              netSavings >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
            }`}
          >
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
