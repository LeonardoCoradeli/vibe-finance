'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Category, Wallet } from '@/types/finance';
import {
  X,
  Plus,
  Trash2,
  Tag,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  Ban,
} from 'lucide-react';

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (category: Category) => void;
  initialCreating?: boolean;
}

const PRESET_COLORS = [
  '#ef4444', // Vermelho
  '#f97316', // Laranja
  '#10b981', // Verde
  '#3b82f6', // Azul
  '#8b5cf6', // Roxo
  '#ec4899', // Rosa
  '#06b6d4', // Ciano
  '#eab308', // Amarelo
];

export function CategoryManagementModal({ isOpen, onClose, onCreated, initialCreating }: CategoryManagementModalProps) {
  const { categories, wallets, addCategory, deleteCategory } = useFinance();

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [description, setDescription] = useState('');
  const [blockedWallets, setBlockedWallets] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setIsCreating(Boolean(initialCreating));
      setName('');
      setDescription('');
      setColor(PRESET_COLORS[0]);
      setBlockedWallets([]);
      setErrorMessage(null);
    }
  }, [isOpen, initialCreating]);

  if (!isOpen) return null;

  const toggleBlockedWallet = (walletId: string) => {
    setBlockedWallets((prev) =>
      prev.includes(walletId) ? prev.filter((id) => id !== walletId) : [...prev, walletId]
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Informe o nome da categoria.');
      return;
    }

    const newCat = addCategory({
      name: name.trim(),
      color,
      description: description.trim() || undefined,
      blockedWallets,
    });

    if (onCreated) {
      onCreated(newCat);
    }

    setName('');
    setDescription('');
    setColor(PRESET_COLORS[0]);
    setBlockedWallets([]);
    setIsCreating(false);
  };

  const handleDelete = (category: Category) => {
    setErrorMessage(null);
    const res = deleteCategory(category.id);
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
              <Tag className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Categorias & Regras de Não-Contaminação</h3>
              <p className="text-xs text-gray-400">Defina quais bolsões NÃO podem ser usados para cada categoria.</p>
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

        {/* Mensagem de Erro */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Conteúdo Rolável */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
          {/* Formulário de Criação Rápida */}
          {isCreating ? (
            <form onSubmit={handleCreate} className="p-4 bg-gray-950/80 border border-emerald-500/40 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Nova Categoria Customizada</h4>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  Cancelar
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1">Nome da Categoria *</label>
                <input
                  type="text"
                  placeholder="Ex: Transporte, Lazer, Saúde, Pets, Educação"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1">Descrição (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Gastos com combustível, Uber e pedágio."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1.5">Cor da Categoria</label>
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

              {/* Blocklist Checkboxes */}
              <div className="pt-1">
                <label className="block text-[11px] font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Ban className="w-3.5 h-3.5 text-red-400" />
                  Quais bolsões NÃO podem ser usados para pagar esta categoria? (Blocklist)
                </label>
                <p className="text-[10px] text-gray-500 mb-2">
                  Bolsões desmarcados serão aceitos livremente. Marque aqueles que devem ser proibidos.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {wallets.map((w) => {
                    const isBlocked = blockedWallets.includes(w.id);
                    return (
                      <label
                        key={w.id}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition select-none ${
                          isBlocked
                            ? 'bg-red-950/20 border-red-500/40 text-red-300'
                            : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isBlocked}
                          onChange={() => toggleBlockedWallet(w.id)}
                          className="rounded border-gray-700 text-red-500 focus:ring-0"
                        />
                        <span className="truncate">{w.name}</span>
                      </label>
                    );
                  })}
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
                  Salvar Categoria
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
              <span>Adicionar Nova Categoria de Gastos</span>
            </button>
          )}

          {/* Lista de Categorias Existentes */}
          <div className="space-y-2.5 pt-1">
            {categories.map((category) => {
              const blockedNames = category.blockedWallets
                .map((wid) => wallets.find((w) => w.id === wid)?.name || wid)
                .filter(Boolean);

              return (
                <div
                  key={category.id}
                  className="p-3.5 bg-gray-950/80 border border-gray-800 hover:border-gray-700 rounded-2xl transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{category.name}</span>
                        {category.isFixed && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-800 text-gray-400 border border-gray-700/60 font-medium">
                            Padrão
                          </span>
                        )}
                      </div>

                      {/* Regras de Bloqueio da Categoria */}
                      <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                        {blockedNames.length > 0 ? (
                          <span className="text-red-400/90 flex items-center gap-1 font-medium">
                            <Ban className="w-3 h-3 text-red-400" />
                            Bloqueia: {blockedNames.join(', ')}
                          </span>
                        ) : (
                          <span className="text-emerald-400/80 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Aceita todos os bolsões
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!category.isFixed && (
                    <button
                      type="button"
                      onClick={() => handleDelete(category)}
                      className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-red-500/40 text-gray-400 hover:text-red-400 transition shrink-0"
                      title="Excluir categoria customizada"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
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
