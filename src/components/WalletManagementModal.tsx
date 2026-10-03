'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Wallet } from '@/types/finance';
import {
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Wallet as WalletIcon,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface WalletManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCreating?: boolean;
}

const PRESET_COLORS = [
  '#3b82f6', // Azul
  '#10b981', // Verde esmeralda
  '#f59e0b', // Âmbar / Laranja
  '#8b5cf6', // Roxo
  '#ec4899', // Rosa
  '#06b6d4', // Ciano
  '#eab308', // Amarelo
  '#6366f1', // Índigo
];

export function WalletManagementModal({ isOpen, onClose, initialCreating }: WalletManagementModalProps) {
  const { wallets, balances, addWallet, deleteWallet, toggleWalletVisibility } = useFinance();

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setIsCreating(Boolean(initialCreating));
      setName('');
      setDescription('');
      setColor(PRESET_COLORS[0]);
      setErrorMessage(null);
    }
  }, [isOpen, initialCreating]);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Informe o nome do novo bolsão.');
      return;
    }

    addWallet({
      name: name.trim(),
      color,
      description: description.trim() || undefined,
    });

    setName('');
    setDescription('');
    setColor(PRESET_COLORS[0]);
    setIsCreating(false);
  };

  const handleDelete = (wallet: Wallet) => {
    setErrorMessage(null);
    const res = deleteWallet(wallet.id);
    if (!res.success && res.error) {
      setErrorMessage(res.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <WalletIcon className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Gerenciar Bolsões de Saldo</h3>
              <p className="text-xs text-gray-400">Configure visibilidade e crie novos bolsões para o seu patrimônio.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg transition"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensagem de Erro/Alerta */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Conteúdo rolável */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
          {/* Formulário de Criação Rápida */}
          {isCreating ? (
            <form onSubmit={handleCreate} className="p-4 bg-gray-950/80 border border-emerald-500/40 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Novo Bolsão Customizado</h4>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  Cancelar
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1">Nome do Bolsão *</label>
                <input
                  type="text"
                  placeholder="Ex: Vale Mobilidade, Caixinha Viagem, PJ"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1">Descrição Curta (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Exclusivo para combustível e transporte."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1.5">Cor Temática</label>
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        color === c ? 'scale-110 border-white shadow-sm' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-gray-400 hover:text-white bg-gray-900 border border-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                >
                  Salvar Bolsão
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="w-full py-2.5 px-4 rounded-2xl border border-dashed border-gray-700 hover:border-emerald-500/60 bg-gray-950/40 hover:bg-gray-800/40 text-gray-300 hover:text-white flex items-center justify-center gap-2 text-xs font-semibold transition group"
            >
              <Plus className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Adicionar Novo Bolsão de Saldo</span>
            </button>
          )}

          {/* Lista de Bolsões Existentes */}
          <div className="space-y-2.5 pt-1">
            {wallets.map((wallet) => {
              const balance = balances[wallet.id] || 0;
              return (
                <div
                  key={wallet.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    wallet.isHidden
                      ? 'bg-gray-950/30 border-gray-800/60 opacity-60'
                      : 'bg-gray-950/80 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: wallet.color }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{wallet.name}</span>
                        {wallet.isFixed && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-800 text-gray-400 border border-gray-700/60 font-medium">
                            Nativo
                          </span>
                        )}
                        {wallet.isHidden && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                            Oculto no Dashboard
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {wallet.description || 'Disponível para transações conforme regras.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Botão de Visibilidade (Ocultar/Exibir) */}
                    <button
                      type="button"
                      onClick={() => toggleWalletVisibility(wallet.id)}
                      className={`p-1.5 rounded-lg border text-xs transition flex items-center gap-1 ${
                        wallet.isHidden
                          ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                      title={wallet.isHidden ? 'Reativar no Dashboard' : 'Ocultar do Dashboard'}
                    >
                      {wallet.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>

                    {/* Botão de Excluir (somente customizados) */}
                    {!wallet.isFixed && (
                      <button
                        type="button"
                        onClick={() => handleDelete(wallet)}
                        className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-red-500/40 text-gray-400 hover:text-red-400 transition"
                        title="Excluir bolsão customizado"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rodapé */}
        <div className="pt-4 border-t border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-semibold transition"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
