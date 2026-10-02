'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/lib/firebase/authContext';
import { getMonthLabel } from '@/lib/formatters';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileUp,
  PlusCircle,
  LogOut,
  User as UserIcon,
  Cloud,
  HardDrive,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';

interface HeaderProps {
  onOpenProposalModal: () => void;
  onOpenPDFModal: () => void;
  onOpenTransactionModal: () => void;
}

export function Header({
  onOpenProposalModal,
  onOpenPDFModal,
  onOpenTransactionModal,
}: HeaderProps) {
  const { selectedMonth, setSelectedMonth, resetData, loadDemoData, isSyncing } = useFinance();
  const { user, isConfigured, signInWithGoogle, signInWithQAMock, logout } = useAuth();
  const [authErrorModal, setAuthErrorModal] = useState<string | null>(null);

  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    let newYear = year;
    let newMonth = month - 1;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    setSelectedMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    let newYear = year;
    let newMonth = month + 1;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    setSelectedMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleCloudLoginClick = async () => {
    if (!isConfigured) {
      // Abre modal explicando como configurar credenciais reais e oferecendo conta QA
      setAuthErrorModal(
        'As credenciais do Firebase ainda não foram configuradas no arquivo .env.local. Você pode cadastrá-las ou testar o fluxo completo de sincronização agora mesmo utilizando a Conta de QA!'
      );
      return;
    }

    const res = await signInWithGoogle();
    if (!res.success && res.error) {
      setAuthErrorModal(res.error);
    }
  };

  return (
    <>
      <header className="border-b border-gray-800 bg-[#0d131f]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo & Modo de Operação */}
            <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
              <div className="flex items-center space-x-2.5">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold text-xl">
                  ₿
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                    Gestão Financeira
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Pro
                    </span>
                  </h1>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    {user ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <Cloud className="w-3 h-3" />
                        {isSyncing ? 'Sincronizando Nuvem...' : `Nuvem: ${user.email?.split('@')[0]}`}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-400/90 font-medium" title="Dados em memória">
                        <HardDrive className="w-3 h-3" /> Modo Convidado (Em memória)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botões de Ação de Estado (Demo e Limpar) */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={loadDemoData}
                  title="Carregar Dados de Exemplo"
                  className="px-2 py-1 text-[11px] font-medium text-gray-400 hover:text-white bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-lg transition flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3 text-emerald-400" />
                  <span className="hidden sm:inline">Exemplo</span>
                </button>
                <button
                  onClick={resetData}
                  title="Limpar tudo e recomeçar do zero"
                  className="px-2 py-1 text-[11px] font-medium text-gray-400 hover:text-red-400 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-lg transition flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Zerar</span>
                </button>
              </div>
            </div>

            {/* Navegador de Mês */}
            <div className="flex items-center bg-gray-900/90 border border-gray-800 rounded-xl px-2 py-1 shadow-inner">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
                title="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-4 text-sm font-semibold text-gray-200 tracking-wide min-w-[150px] text-center">
                {getMonthLabel(selectedMonth)}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
                title="Próximo mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Botões de Ação Principal */}
            <div className="flex items-center gap-2.5 flex-wrap justify-center w-full md:w-auto">
              {/* Proposta de Gasto IA & PO */}
              <button
                onClick={onOpenProposalModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                Proposta de Gasto
              </button>

              {/* Importar PDF */}
              <button
                onClick={onOpenPDFModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700/80 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <FileUp className="w-3.5 h-3.5 text-blue-400" />
                Extrato PDF
              </button>

              {/* Nova Transação */}
              <button
                onClick={onOpenTransactionModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Nova Transação
              </button>

              {/* Autenticação Google / QA / Logout */}
              {user ? (
                <div className="flex items-center gap-2 pl-1 border-l border-gray-800">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Usuário'}
                      className="w-8 h-8 rounded-full border border-emerald-500/50"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/40">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                  <button
                    onClick={logout}
                    title="Sair da conta"
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleCloudLoginClick}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 border border-gray-700 transition"
                  title="Conectar com o Firebase / Google"
                >
                  <Cloud className="w-3.5 h-3.5 text-gray-400" />
                  Salvar na Nuvem
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modal de Conexão com Firebase / QA Account */}
      {authErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6">
            <button
              onClick={() => setAuthErrorModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 text-amber-400 mb-3">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Conexão com a Nuvem</h3>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              {authErrorModal}
            </p>

            <div className="mt-4 p-3 bg-gray-950 rounded-xl border border-gray-800 text-[11px] text-gray-400 space-y-1">
              <p className="font-semibold text-gray-200">Como conectar seu projeto Firebase real:</p>
              <p>Adicione suas chaves no arquivo <code className="text-emerald-400">.env.local</code>:</p>
              <p className="text-[10px] font-mono text-gray-500">
                NEXT_PUBLIC_FIREBASE_API_KEY=...<br />
                NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
              </p>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setAuthErrorModal(null)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-gray-400 hover:text-white transition"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  signInWithQAMock();
                  setAuthErrorModal(null);
                }}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20 transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Entrar como Conta de QA</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
