'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import {
  CATEGORIES_CONFIG,
  WALLET_NAMES,
  TransactionCategory,
  WalletSource,
} from '@/types/finance';
import {
  evaluateExpenseProposal,
  EvaluationReport,
  ExpenseProposal,
} from '@/lib/engine';
import { formatCurrency } from '@/lib/formatters';
import {
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Binary,
  BarChart2,
  Cpu,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProposalModal({ isOpen, onClose }: ProposalModalProps) {
  const {
    balances,
    monthlyIncome,
    monthlyExpense,
    categoryExpenses,
    budgets,
    goals,
    transactions,
    addTransaction,
    selectedMonth,
  } = useFinance();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('lazer');
  const [wallet, setWallet] = useState<WalletSource>('LIVRE');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<EvaluationReport | null>(null);

  if (!isOpen) return null;

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0 || !description.trim()) {
      return;
    }

    setLoading(true);
    setReport(null);

    const proposal: ExpenseProposal = {
      description: description.trim(),
      amount: numAmount,
      category,
      wallet,
    };

    try {
      const result = await evaluateExpenseProposal({
        proposal,
        balances,
        monthlyIncome,
        monthlyExpense,
        categoryExpenses,
        budgets,
        goals,
        historicalTransactions: transactions,
      });
      setReport(result);
    } catch (err) {
      console.error('Erro na avaliação da proposta:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyExpense = () => {
    if (!report) return;

    const today = new Date().toISOString().split('T')[0];
    const dateToUse = today.startsWith(selectedMonth) ? today : `${selectedMonth}-01`;

    addTransaction({
      description: report.proposal.description,
      amount: report.proposal.amount,
      type: 'expense',
      category: report.proposal.category,
      wallet: report.proposal.wallet,
      date: dateToUse,
      status: 'completed',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl p-5 sm:p-7 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition p-1.5 rounded-lg hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Simulador de Proposta de Gasto</h3>
            <p className="text-xs text-gray-400">
              Avaliação de impacto com Pesquisa Operacional, Anomalias Estatísticas e SLM.
            </p>
          </div>
        </div>

        {/* Formulário da Proposta */}
        <form onSubmit={handleEvaluate} className="mt-5 space-y-3.5 bg-gray-950/70 p-4 rounded-2xl border border-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                O que você pretende comprar?
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Tênis novo, Viagem de feriado, Smart TV"
                className="w-full px-3 py-2 text-sm bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Valor Previsto (R$)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="w-full px-3 py-2 text-sm bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Categoria de Gasto</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full px-3 py-2 text-sm bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
              >
                {Object.values(CATEGORIES_CONFIG).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Bolsão / Fonte</label>
              <select
                value={wallet}
                onChange={(e) => setWallet(e.target.value as WalletSource)}
                className="w-full px-3 py-2 text-sm bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
              >
                {Object.entries(WALLET_NAMES).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 hover:opacity-95 transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 disabled:opacity-50"
          >
            {loading ? (
              <span>Processando os 3 Motores de Decisão...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-yellow-300" />
                Avaliar Proposta de Gasto
              </>
            )}
          </button>
        </form>

        {/* Exibição dos Resultados dos 3 Motores */}
        {report && (
          <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2">
            {/* Veredito Geral Principal */}
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                report.finalRecommendation === 'APROVADO'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : report.finalRecommendation === 'ALERTA'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              <div className="flex items-center gap-3">
                {report.finalRecommendation === 'APROVADO' ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                ) : report.finalRecommendation === 'ALERTA' ? (
                  <AlertTriangle className="w-8 h-8 text-amber-400" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-400" />
                )}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
                    Recomendação Final Sintetizada
                  </span>
                  <p className="text-xl font-extrabold tracking-tight">
                    {report.finalRecommendation === 'APROVADO' && 'Gasto Aprovado com Segurança'}
                    {report.finalRecommendation === 'ALERTA' && 'Gasto Requer Atenção'}
                    {report.finalRecommendation === 'REPROVADO' && 'Gasto Desaconselhado'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-gray-400">Score de Impacto</span>
                <p className="text-xl font-bold">{report.slm.impactScore}/100</p>
              </div>
            </div>

            {/* Grid dos 3 Pilares */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Pilar 1: Pesquisa Operacional */}
              <div className="bg-gray-950 border border-gray-800 rounded-2xl p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase text-gray-400 flex items-center gap-1">
                      <Binary className="w-3.5 h-3.5 text-blue-400" />
                      1. Pesq. Operacional
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        report.linearProgramming.viable
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {report.linearProgramming.viable ? 'Viável' : 'Inviável'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-300">
                    <p className="text-[11px] text-gray-400">
                      Saldo restante:{' '}
                      <strong className="text-white">
                        {formatCurrency(report.linearProgramming.remainingWalletBalance)}
                      </strong>
                    </p>
                    {report.linearProgramming.violations.length > 0 ? (
                      <div className="space-y-1 pt-1">
                        {report.linearProgramming.violations.map((viol, idx) => (
                          <p key={idx} className="text-[11px] text-red-400 flex items-start gap-1">
                            <X className="w-3 h-3 shrink-0 mt-0.5" />
                            <span>{viol}</span>
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-emerald-400 flex items-center gap-1 pt-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Todas as restrições respeitadas.</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Pilar 2: Anomalias Estatísticas */}
              <div className="bg-gray-950 border border-gray-800 rounded-2xl p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase text-gray-400 flex items-center gap-1">
                      <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
                      2. Estatística (Z-Score)
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        report.anomalyDetection.risk === 'baixo'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : report.anomalyDetection.risk === 'medio'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      Risco {report.anomalyDetection.risk.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-gray-300">
                    <p className="text-[11px] text-gray-400">
                      Z-Score: <strong className="text-white">{report.anomalyDetection.zScore}</strong>
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Média Histórica:{' '}
                      <strong className="text-white">
                        {formatCurrency(report.anomalyDetection.mean)}
                      </strong>
                    </p>
                    <p className="text-[11px] text-gray-300 pt-1 leading-snug">
                      {report.anomalyDetection.explanation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pilar 3: SLM Compacto */}
              <div className="bg-gray-950 border border-gray-800 rounded-2xl p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase text-gray-400 flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-purple-400" />
                      3. SLM Veredito JSON
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        report.slm.verdict === 'sim'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {report.slm.verdict === 'sim' ? 'SIM' : 'NÃO'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-300">
                    <p className="text-[11px] text-gray-300 leading-snug">
                      {report.slm.justification}
                    </p>
                    <div className="pt-1.5 border-t border-gray-800">
                      <span className="text-[10px] font-semibold text-amber-400 flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        Trade-Off:
                      </span>
                      <p className="text-[10px] text-gray-400 leading-tight mt-0.5">
                        {report.slm.tradeOff}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ação de Efetivação */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <span className="text-xs text-gray-500">
                Você pode optar por realizar a despesa mesmo com alertas.
              </span>
              <button
                onClick={handleApplyExpense}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
              >
                <span>Confirmar & Efetivar no Extrato</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
