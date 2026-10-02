'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import {
  CATEGORIES_CONFIG,
  WALLET_NAMES,
  TransactionCategory,
  TransactionType,
  WalletSource,
  validateWalletCompatibility,
} from '@/types/finance';
import { X, PlusCircle, AlertCircle } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionModal({ isOpen, onClose }: TransactionModalProps) {
  const { addTransaction, selectedMonth } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('moradia_contas');
  const [wallet, setWallet] = useState<WalletSource>('LIVRE');
  const [date, setDate] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return today.startsWith(selectedMonth) ? today : `${selectedMonth}-01`;
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Atualizar carteira recomendada ao mudar categoria se for incompatível
  const handleCategoryChange = (newCat: TransactionCategory) => {
    setCategory(newCat);
    const config = CATEGORIES_CONFIG[newCat];
    if (config && !config.allowedWallets.includes(wallet)) {
      setWallet(config.defaultWallet);
    }
    setErrorMessage(null);
  };

  const handleWalletChange = (newWallet: WalletSource) => {
    setWallet(newWallet);
    if (type === 'expense') {
      const validation = validateWalletCompatibility(category, newWallet);
      if (!validation.valid) {
        setErrorMessage(validation.reason || 'Bolsão incompatível com esta categoria.');
      } else {
        setErrorMessage(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage('Informe um valor monetário válido maior que zero.');
      return;
    }

    if (!description.trim()) {
      setErrorMessage('Informe a descrição do lançamento.');
      return;
    }

    const result = addTransaction({
      description: description.trim(),
      amount: numericAmount,
      type,
      category,
      wallet,
      date,
      status: 'completed',
    });

    if (!result.success) {
      setErrorMessage(result.error || 'Erro ao adicionar transação.');
      return;
    }

    // Limpar formulário e fechar
    setDescription('');
    setAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-emerald-400" />
          Novo Lançamento
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Cadastre uma nova receita ou despesa respeitando os bolsões financeiros.
        </p>

        {errorMessage && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Tipo de Transação (Receita vs Despesa) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-950 rounded-xl border border-gray-800">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                type === 'expense'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Despesa (Saída)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Receita (Entrada)
            </button>
          </div>

          {/* Descrição & Valor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Descrição</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Supermercado, Aluguel, Salário"
                className="w-full px-3 py-2 text-sm bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="w-full px-3 py-2 text-sm bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Categoria</label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as TransactionCategory)}
              className="w-full px-3 py-2 text-sm bg-gray-950 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
            >
              {Object.values(CATEGORIES_CONFIG).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bolsão de Recurso (Wallet) com indicação de restrição */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Bolsão de Destino / Origem
            </label>
            <select
              value={wallet}
              onChange={(e) => handleWalletChange(e.target.value as WalletSource)}
              className="w-full px-3 py-2 text-sm bg-gray-950 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
            >
              {Object.entries(WALLET_NAMES).map(([wKey, wConfig]) => (
                <option key={wKey} value={wKey}>
                  {wConfig.name}
                </option>
              ))}
            </select>
            {type === 'expense' && category === 'moradia_contas' && (
              <p className="mt-1 text-[11px] text-gray-400">
                🔒 Contas de consumo e boletos aceitam apenas saldo <strong>Livre</strong>.
              </p>
            )}
          </div>

          {/* Data */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-950 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Ações */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition"
            >
              Confirmar Lançamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
