'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { FinancialGoal, WALLET_NAMES, WalletSource } from '@/types/finance';
import { formatCurrency, formatDateBR } from '@/lib/formatters';
import { Target, Plus, Trash2, Calendar, PiggyBank } from 'lucide-react';

export function GoalsSection() {
  const { goals, addGoal, deleteGoal } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [monthlyTarget, setMonthlyTarget] = useState('');
  const [deadline, setDeadline] = useState('2026-12-31');
  const [targetWallet, setTargetWallet] = useState<WalletSource>('RESERVA_EMERGENCIA');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount.replace(',', '.'));
    const current = parseFloat(currentAmount.replace(',', '.')) || 0;
    const monthly = parseFloat(monthlyTarget.replace(',', '.')) || 0;

    if (!title.trim() || isNaN(target) || target <= 0) return;

    addGoal({
      title: title.trim(),
      targetAmount: target,
      currentAmount: current,
      monthlyTarget: monthly,
      deadline,
      targetWallet,
    });

    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setMonthlyTarget('');
    setIsAdding(false);
  };

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Metas & Planejamento</h3>
            <p className="text-xs text-gray-400">
              Integrado com o motor de Pesquisa Operacional para garantir viabilidade.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs font-semibold px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-xl transition flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Meta</span>
        </button>
      </div>

      {/* Formulário Inline de Nova Meta */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="mb-4 p-4 bg-gray-950 rounded-2xl border border-gray-800 space-y-3 animate-in fade-in"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Título da Meta</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Carro novo, Reserva 6 meses"
                className="w-full px-3 py-1.5 text-xs bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Valor Alvo (R$)</label>
              <input
                type="number"
                step="0.01"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="0,00"
                className="w-full px-3 py-1.5 text-xs bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Já Economizado (R$)</label>
              <input
                type="number"
                step="0.01"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                placeholder="0,00"
                className="w-full px-3 py-1.5 text-xs bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Aporte Mensal Previsto</label>
              <input
                type="number"
                step="0.01"
                value={monthlyTarget}
                onChange={(e) => setMonthlyTarget(e.target.value)}
                placeholder="0,00"
                className="w-full px-3 py-1.5 text-xs bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Data Limite</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-gray-400 hover:text-white px-3 py-1.5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="text-xs font-semibold px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow transition"
            >
              Salvar Meta
            </button>
          </div>
        </form>
      )}

      {/* Lista de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {goals.map((goal) => {
          const progress = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
          return (
            <div
              key={goal.id}
              className="p-4 bg-gray-950/70 border border-gray-800 rounded-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-wide">{goal.title}</h4>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" /> Prazo: {formatDateBR(goal.deadline)}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="text-gray-500 hover:text-red-400 p-1"
                    title="Excluir meta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-3">
                  <div className="flex items-baseline justify-between text-xs mb-1">
                    <span className="text-gray-400">Progresso</span>
                    <span className="font-bold text-purple-400">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden border border-gray-800">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-gray-800/80 flex items-center justify-between text-xs">
                <span className="text-gray-400">
                  {formatCurrency(goal.currentAmount)} de{' '}
                  <strong className="text-white">{formatCurrency(goal.targetAmount)}</strong>
                </span>
                <span className="text-[11px] text-emerald-400 font-medium">
                  +{formatCurrency(goal.monthlyTarget)}/mês
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
