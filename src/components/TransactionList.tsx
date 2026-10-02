'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { CATEGORIES_CONFIG, WALLET_NAMES, TransactionType, WalletSource } from '@/types/finance';
import { formatCurrency, formatDateBR } from '@/lib/formatters';
import {
  ListFilter,
  Trash2,
  TrendingDown,
  TrendingUp,
  Search,
} from 'lucide-react';

export function TransactionList() {
  const { monthlyTransactions, deleteTransaction } = useFinance();

  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [walletFilter, setWalletFilter] = useState<'all' | WalletSource>('all');
  const [search, setSearch] = useState('');

  const filtered = monthlyTransactions.filter((tx) => {
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    if (walletFilter !== 'all' && tx.wallet !== walletFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchDesc = tx.description.toLowerCase().includes(q);
      const catConfig = CATEGORIES_CONFIG[tx.category];
      const matchCat = catConfig && catConfig.name.toLowerCase().includes(q);
      if (!matchDesc && !matchCat) return false;
    }
    return true;
  });

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
      {/* Header da Seção & Filtros */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ListFilter className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Extrato de Lançamentos</h3>
              <p className="text-xs text-gray-400">
                {filtered.length} transações no período selecionado
              </p>
            </div>
          </div>

          {/* Campo de Busca Rápida */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar lançamento..."
              className="pl-8 pr-3 py-1.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 w-full sm:w-56"
            />
          </div>
        </div>

        {/* Barra de Filtros de Tipo e Bolsão */}
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-3 border-b border-gray-800/80">
          <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-xl border border-gray-800">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                typeFilter === 'all'
                  ? 'bg-gray-800 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                typeFilter === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Entradas
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                typeFilter === 'expense'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Saídas
            </button>
          </div>

          <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-xl border border-gray-800">
            <button
              onClick={() => setWalletFilter('all')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                walletFilter === 'all'
                  ? 'bg-gray-800 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Todos Bolsões
            </button>
            <button
              onClick={() => setWalletFilter('LIVRE')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                walletFilter === 'LIVRE'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Livre
            </button>
            <button
              onClick={() => setWalletFilter('BENEFICIO_VR_VA')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                walletFilter === 'BENEFICIO_VR_VA'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              VR / VA
            </button>
            <button
              onClick={() => setWalletFilter('RESERVA_EMERGENCIA')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                walletFilter === 'RESERVA_EMERGENCIA'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Reserva
            </button>
          </div>
        </div>

        {/* Lista de Transações */}
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            Nenhuma transação encontrada com os filtros selecionados.
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((tx) => {
              const catConfig = CATEGORIES_CONFIG[tx.category];
              const walletConfig = WALLET_NAMES[tx.wallet];
              const isIncome = tx.type === 'income';

              return (
                <div
                  key={tx.id}
                  className="p-3 bg-gray-950/70 hover:bg-gray-950 border border-gray-800/80 hover:border-gray-700 rounded-2xl flex items-center justify-between gap-3 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {isIncome ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-white tracking-wide">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] text-gray-500">
                          {formatDateBR(tx.date)}
                        </span>
                        {catConfig && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor: `${catConfig.color}20`,
                              color: catConfig.color,
                            }}
                          >
                            {catConfig.name}
                          </span>
                        )}
                        {walletConfig && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full border ${walletConfig.badgeColor}`}
                          >
                            {tx.wallet === 'BENEFICIO_VR_VA'
                              ? 'VR/VA'
                              : tx.wallet === 'LIVRE'
                              ? 'Livre'
                              : 'Reserva'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-bold tracking-tight ${
                        isIncome ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                    </span>

                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      title="Excluir lançamento"
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-900 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
