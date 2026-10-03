'use client';

import React, { useRef, useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/lib/formatters';
import {
  Wallet as WalletIcon,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CheckCircle2,
  AlertCircle,
  Plus,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Utensils,
} from 'lucide-react';
import { WalletManagementModal } from './WalletManagementModal';

export function WalletSummaryCards() {
  const { wallets, balances, monthlyIncome, monthlyExpense, netSavings } = useFinance();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isCreatingInitial, setIsCreatingInitial] = useState(false);

  // Filtra apenas bolsões não ocultados
  const visibleWallets = wallets.filter((w) => !w.isHidden);

  const openManageModal = (creating = false) => {
    setIsCreatingInitial(creating);
    setIsManageModalOpen(true);
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const getWalletIcon = (walletId: string) => {
    if (walletId === 'BENEFICIO_VR_VA') return <Utensils className="w-4 h-4" />;
    if (walletId === 'RESERVA_EMERGENCIA') return <ShieldCheck className="w-4 h-4" />;
    return <WalletIcon className="w-4 h-4" />;
  };

  return (
    <>
      <div className="space-y-4">
        {/* Cabeçalho dos Bolsões com Total, Ações e Navegação */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <WalletIcon className="w-3.5 h-3.5 text-emerald-400" />
                Bolsões de Saldo & Regras de Segregação
              </h2>
              <button
                type="button"
                onClick={() => openManageModal(false)}
                className="px-2 py-0.5 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition flex items-center gap-1"
                title="Gerenciar bolsões e visibilidade"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Gerenciar</span>
              </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs text-gray-500">
                Saldo Total: <strong className="text-gray-200">{formatCurrency(balances.total)}</strong>
              </span>

              {/* Botões de navegação por seta do Carrossel */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={scrollLeft}
                  className="p-1 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white transition"
                  title="Rolar para esquerda"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={scrollRight}
                  className="p-1 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white transition"
                  title="Rolar para direita"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Carrossel Horizontal de Bolsões */}
          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto snap-x scroll-smooth pb-2 pt-1 no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {visibleWallets.map((wallet) => {
              const balance = balances[wallet.id] || 0;
              const isVr = wallet.id === 'BENEFICIO_VR_VA';
              const isReserva = wallet.id === 'RESERVA_EMERGENCIA';

              return (
                <div
                  key={wallet.id}
                  className="min-w-[280px] sm:min-w-[300px] max-w-[320px] shrink-0 snap-start relative overflow-hidden bg-gradient-to-b from-gray-900 to-[#0e1726] border rounded-2xl p-4 shadow-lg transition-all"
                  style={{ borderColor: `${wallet.color}40` }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full border truncate max-w-[200px]"
                      style={{
                        backgroundColor: `${wallet.color}15`,
                        color: wallet.color,
                        borderColor: `${wallet.color}35`,
                      }}
                    >
                      {wallet.name}
                    </span>
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${wallet.color}20`,
                        color: wallet.color,
                      }}
                    >
                      {getWalletIcon(wallet.id)}
                    </div>
                  </div>

                  <div className="mt-3">
                    <p
                      className="text-2xl font-bold tracking-tight"
                      style={{ color: isVr ? '#fde047' : isReserva ? '#d8b4fe' : '#ffffff' }}
                    >
                      {formatCurrency(balance)}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                      {isVr ? (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="text-amber-400/90 font-medium">Exclusivo p/ alimentação. Não paga contas!</span>
                        </>
                      ) : isReserva ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span className="text-purple-300/80">Saldo protegido contra despesas do dia a dia.</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-gray-300/80">{wallet.description || 'Disponível para despesas gerais.'}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Card Pontilhado: + Adicionar Bolsão no final da fila */}
            <button
              type="button"
              onClick={() => openManageModal(true)}
              className="min-w-[240px] shrink-0 snap-start border border-dashed border-gray-700 hover:border-emerald-500/60 bg-gray-900/30 hover:bg-gray-800/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-gray-800 group-hover:bg-emerald-500/20 text-gray-400 group-hover:text-emerald-400 flex items-center justify-center transition-transform group-hover:scale-110 mb-2 border border-gray-700 group-hover:border-emerald-500/30">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">
                + Adicionar Bolsão
              </span>
              <span className="text-[10px] text-gray-500 mt-0.5">
                Crie regras e fontes customizadas
              </span>
            </button>
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

      {/* Modal de Gerenciamento de Bolsões */}
      <WalletManagementModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        initialCreating={isCreatingInitial}
      />
    </>
  );
}
