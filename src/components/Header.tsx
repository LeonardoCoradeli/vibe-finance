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
  CheckCircle2,
  AlertCircle,
  X,
  Users,
  ShieldAlert,
  ArrowRightLeft,
  ExternalLink,
} from 'lucide-react';

function GoogleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

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
  const { selectedMonth, setSelectedMonth, isSyncing, cloudSyncError, syncToCloudNow } = useFinance();
  const { user, isConfigured, isQaModeEnabled, signInWithGoogle, signInWithQAMock, logout } = useAuth();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);

  const isQaActive = Boolean(user?.uid?.startsWith('qa-'));
  const isGoogleActive = Boolean(user && !isQaActive);

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

  const handleGoogleSignIn = async () => {
    setAuthErrorMessage(null);
    setIsGoogleLoading(true);

    try {
      const res = await signInWithGoogle();
      if (res.success) {
        setIsProfileModalOpen(false);
      } else if (res.error) {
        setAuthErrorMessage(res.error);
      }
    } catch (err: any) {
      setAuthErrorMessage(err?.message || 'Falha ao autenticar com o Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSwitchToGuest = async () => {
    await logout();
    setIsProfileModalOpen(false);
  };

  return (
    <>
      <header className="border-b border-gray-800 bg-[#0d131f]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo & Marca (Estático, limpo, sem modo convidado embaixo) */}
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
                </div>
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
            <div className="flex items-center gap-3 flex-wrap justify-center w-full md:w-auto">
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

              {/* Bolinha de Perfil com Nome Embaixo (Convidado ou Usuário Conectado) */}
              <button
                type="button"
                onClick={() => {
                  setAuthErrorMessage(null);
                  setIsProfileModalOpen(true);
                }}
                className="flex flex-col items-center justify-center gap-1 px-2.5 py-1 rounded-xl hover:bg-gray-800/70 border border-transparent hover:border-gray-700/80 transition group cursor-pointer shrink-0"
                title={user ? `Conectado como ${user.email || user.displayName}. Clique para gerenciar o perfil.` : 'Modo Convidado. Clique para conectar seu perfil.'}
                aria-label={user ? `Perfil: ${user.email || user.displayName}` : 'Perfil: Convidado'}
              >
                {/* Bolinha / Avatar */}
                {user ? (
                  <div className="relative">
                    {user.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.photoURL}
                        alt={user.displayName || user.email || 'Usuário'}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full border-2 border-emerald-500/80 object-cover shadow-sm group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/60 shadow-sm group-hover:scale-105 transition-transform">
                        <UserIcon className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {isGoogleActive && cloudSyncError && (
                      <span
                        className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-gray-900 ring-1 ring-amber-400/50 animate-pulse"
                        title="Atenção: Erro ao sincronizar com o banco de dados Cloud Firestore"
                      />
                    )}
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-800 border border-gray-700 text-gray-400 flex items-center justify-center shadow-inner group-hover:border-emerald-500/50 group-hover:text-emerald-400 group-hover:scale-105 transition-all">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* Nome embaixo da bolinha */}
                <span className="text-[10px] font-medium leading-none text-gray-400 group-hover:text-gray-200 transition-colors max-w-[110px] truncate text-center">
                  {user ? (user.email || user.displayName || 'Conectado') : 'Convidado'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modal de Perfis de Acesso & Conexão com Nuvem */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl p-6 overflow-hidden">
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 text-emerald-400 mb-1">
              <Users className="w-5 h-5 shrink-0" />
              <h3 className="text-lg font-bold text-white">Perfis de Acesso & Conexão com a Nuvem</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-5">
              Escolha como deseja operar o aplicativo. Alterne entre o modo local volátil ou sincronize seus dados com a sua conta.
            </p>

            <div className="space-y-3">
              {/* Opção 1: Modo Convidado (Local-First) */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  !user
                    ? 'bg-emerald-950/20 border-emerald-500/50 shadow-sm'
                    : 'bg-gray-950/60 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <HardDrive className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">Modo Convidado</h4>
                        {!user && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Ativo Agora
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Dados residem exclusivamente na memória do navegador. 100% privado, sem cadastro e sem sincronização externa.
                      </p>
                    </div>
                  </div>

                  {user && (
                    <button
                      type="button"
                      onClick={handleSwitchToGuest}
                      className="shrink-0 px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition flex items-center gap-1.5"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Mudar para Convidado</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Opção 2: Conta Google (Nuvem Firebase) */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  isGoogleActive
                    ? 'bg-emerald-950/20 border-emerald-500/50 shadow-sm'
                    : 'bg-gray-950/60 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-gray-800 flex items-center justify-center">
                      <GoogleIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">Conta Google</h4>
                        {isGoogleActive && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Conectado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {isGoogleActive
                          ? `Sincronizado como ${user?.email}`
                          : 'Sincroniza seus lançamentos, extratos e metas no Cloud Firestore.'}
                      </p>
                    </div>
                  </div>
                </div>

                {!isGoogleActive ? (
                  <div className="mt-3.5 pt-3 border-t border-gray-800/80">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleLoading}
                      className="w-full py-2.5 px-4 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-xl flex items-center justify-center gap-2.5 shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] text-xs disabled:opacity-50"
                    >
                      <GoogleIcon className="w-4 h-4" />
                      <span>{isGoogleLoading ? 'Conectando ao Google...' : 'Continuar com o Google'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="mt-3.5 pt-3 border-t border-gray-800/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] flex items-center gap-1.5 font-medium ${cloudSyncError ? 'text-amber-400' : 'text-emerald-400'}`}>
                        <Cloud className="w-3.5 h-3.5" />
                        {cloudSyncError ? 'Aguardando criação do banco Firestore' : (isSyncing ? 'Sincronizando com Firestore...' : 'Nuvem ativa & sincronizada')}
                      </span>
                      <button
                        type="button"
                        onClick={handleSwitchToGuest}
                        className="text-xs text-red-400 hover:text-red-300 transition flex items-center gap-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Desconectar Conta Google</span>
                      </button>
                    </div>

                    {cloudSyncError && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 space-y-2 text-left">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div className="space-y-1 w-full">
                            <p className="font-semibold text-amber-300">Não foi possível salvar no Cloud Firestore</p>
                            <p className="text-[11px] text-amber-200/90 leading-relaxed whitespace-pre-line">
                              {cloudSyncError}
                            </p>
                          </div>
                        </div>
                        <div className="pt-1 flex items-center gap-2 flex-wrap">
                          <a
                            href="https://console.firebase.google.com/project/teste-dc3ae/firestore"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-semibold border border-amber-500/30 transition shadow-sm"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Abrir Firebase Console (Criar Banco Firestore)</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => syncToCloudNow()}
                            disabled={isSyncing}
                            className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-[11px] font-semibold border border-gray-700 transition"
                          >
                            {isSyncing ? 'Testando...' : 'Tentar Novamente'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Opção 3: Conta de QA (Ambiente de Testes) - Controlada por ENV NEXT_PUBLIC_ENABLE_QA_MODE */}
              {isQaModeEnabled && (
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    isQaActive
                      ? 'bg-purple-950/20 border-purple-500/50 shadow-sm'
                      : 'bg-gray-950/60 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">Conta de QA (Testes)</h4>
                          {isQaActive && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> QA Ativo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Usuário simulado (<code className="text-purple-300">qa.tester@financas.app</code>) para testes locais e validações E2E.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-gray-800/80">
                    {!isQaActive ? (
                      <button
                        type="button"
                        onClick={() => {
                          signInWithQAMock();
                          setIsProfileModalOpen(false);
                        }}
                        className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition text-xs shadow-md shadow-purple-600/20"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Entrar como Conta de QA</span>
                      </button>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-purple-300">Simulação de nuvem ativa</span>
                        <button
                          type="button"
                          onClick={handleSwitchToGuest}
                          className="text-xs text-red-400 hover:text-red-300 transition flex items-center gap-1"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sair do Modo QA</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Aviso de erro ou orientação caso ocorra falha */}
            {authErrorMessage && (
              <div className="mt-4 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1.5 text-left w-full">
                  <p className="font-semibold text-amber-300">Atenção na Autenticação</p>
                  <p className="leading-relaxed text-[11px] text-amber-200/90 whitespace-pre-line">{authErrorMessage}</p>
                  {authErrorMessage.includes('Firebase Console') && (
                    <div className="pt-1">
                      <a
                        href="https://console.firebase.google.com/project/teste-dc3ae/authentication/providers"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold border border-amber-500/30 transition shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir Firebase Console (Ativar Provedor Google)</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Guia de Configuração para Vercel e .env */}
            {!isConfigured && (
              <div className="mt-4 p-3.5 bg-gray-950 rounded-2xl border border-gray-800 text-[11px] text-gray-400 space-y-1.5">
                <p className="font-semibold text-gray-200 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  Configuração de Variáveis de Ambiente
                </p>
                <p className="leading-relaxed">
                  Para ativar a sincronização com o Google no servidor ou na Vercel, defina as variáveis no arquivo <code className="text-emerald-400">.env</code> ou no painel da Vercel (<span className="text-gray-300">Project Settings &gt; Environment Variables</span>):
                </p>
                <p className="text-[10px] font-mono text-gray-500">
                  NEXT_PUBLIC_FIREBASE_API_KEY=...<br />
                  NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
