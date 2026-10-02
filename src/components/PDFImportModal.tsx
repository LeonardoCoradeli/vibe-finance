'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { parseBankStatementPDF, ParsedStatementItem, StatementParseResult } from '@/lib/pdf';
import {
  CATEGORIES_CONFIG,
  WALLET_NAMES,
  TransactionCategory,
  WalletSource,
} from '@/types/finance';
import { formatCurrency, formatDateBR } from '@/lib/formatters';
import {
  FileUp,
  X,
  Check,
  AlertCircle,
  FileText,
  Upload,
  CheckSquare,
  Square,
  ArrowRight,
} from 'lucide-react';

interface PDFImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PDFImportModal({ isOpen, onClose }: PDFImportModalProps) {
  const { addTransaction } = useFinance();

  const [loading, setLoading] = useState(false);
  const [parseResult, setParseResult] = useState<StatementParseResult | null>(null);
  const [items, setItems] = useState<ParsedStatementItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Por favor, selecione um arquivo no formato .PDF');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await parseBankStatementPDF(file);
      setParseResult(result);
      setItems(result.items);
      if (result.items.length === 0 && result.errors.length > 0) {
        setError(result.errors.join(' '));
      }
    } catch (err: any) {
      setError(err?.message || 'Falha ao processar o arquivo PDF.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleToggleAll = (select: boolean) => {
    setItems((prev) => prev.map((item) => ({ ...item, selected: select })));
  };

  const handleChangeCategory = (id: string, newCat: TransactionCategory) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const config = CATEGORIES_CONFIG[newCat];
        const newWallet = config && !config.allowedWallets.includes(item.suggestedWallet)
          ? config.defaultWallet
          : item.suggestedWallet;
        return { ...item, suggestedCategory: newCat, suggestedWallet: newWallet };
      })
    );
  };

  const handleChangeWallet = (id: string, newWallet: WalletSource) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, suggestedWallet: newWallet } : item))
    );
  };

  const handleConfirmImport = () => {
    const selectedItems = items.filter((i) => i.selected);
    if (selectedItems.length === 0) return;

    for (const item of selectedItems) {
      addTransaction({
        description: item.description,
        amount: item.amount,
        type: item.type,
        category: item.suggestedCategory,
        wallet: item.suggestedWallet,
        date: item.date,
        status: 'completed',
      });
    }

    onClose();
  };

  const selectedCount = items.filter((i) => i.selected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl p-5 sm:p-7 max-h-[90vh] overflow-y-auto flex flex-col justify-between">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition p-1.5 rounded-lg hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Importador de Extrato Bancário em PDF</h3>
              <p className="text-xs text-gray-400">
                100% seguro e local: o processamento ocorre direto no seu navegador.
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Área de Seleção de Arquivo */}
          {!parseResult && (
            <div className="mt-6 border-2 border-dashed border-gray-800 hover:border-blue-500/50 rounded-2xl p-8 text-center transition bg-gray-950/50">
              <input
                type="file"
                accept=".pdf"
                id="pdf-upload"
                onChange={handleFileUpload}
                disabled={loading}
                className="hidden"
              />
              <label
                htmlFor="pdf-upload"
                className="cursor-pointer flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-200">
                    {loading ? 'Lendo e categorizando PDF...' : 'Clique para selecionar o arquivo PDF do extrato'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Suporta extratos do Nubank, Itaú, Bradesco, Santander, Inter e outros bancos.
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Tabela de Conferência Prévia */}
          {parseResult && (
            <div className="mt-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gray-950 rounded-2xl border border-gray-800">
                <div className="flex items-center gap-3 text-xs text-gray-300">
                  <span>
                    Identificadas: <strong className="text-white">{items.length} transações</strong>
                  </span>
                  <span className="text-emerald-400">
                    Créditos: +{formatCurrency(parseResult.totalCredits)}
                  </span>
                  <span className="text-red-400">
                    Débitos: -{formatCurrency(parseResult.totalDebits)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleAll(true)}
                    className="text-[11px] text-gray-400 hover:text-white px-2 py-1 rounded-lg bg-gray-900 border border-gray-800"
                  >
                    Marcar Todas
                  </button>
                  <button
                    onClick={() => handleToggleAll(false)}
                    className="text-[11px] text-gray-400 hover:text-white px-2 py-1 rounded-lg bg-gray-900 border border-gray-800"
                  >
                    Desmarcar
                  </button>
                </div>
              </div>

              {items.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400 bg-gray-950 rounded-2xl border border-gray-800">
                  Nenhuma linha com data e valor financeiro detectada no PDF fornecido.
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto border border-gray-800 rounded-2xl divide-y divide-gray-800 bg-gray-950">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 flex items-center justify-between gap-3 text-xs transition ${
                        item.selected ? 'bg-transparent' : 'opacity-40 bg-gray-900/30'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleToggleItem(item.id)}
                          className="text-gray-400 hover:text-white"
                        >
                          {item.selected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                        <div>
                          <p className="font-semibold text-white truncate max-w-[200px] sm:max-w-xs">
                            {item.description}
                          </p>
                          <span className="text-[10px] text-gray-500">{formatDateBR(item.date)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Seletor Categoria */}
                        <select
                          value={item.suggestedCategory}
                          onChange={(e) =>
                            handleChangeCategory(item.id, e.target.value as TransactionCategory)
                          }
                          className="px-2 py-1 bg-gray-900 border border-gray-800 rounded-lg text-[11px] text-gray-300 focus:outline-none focus:border-blue-500"
                        >
                          {Object.values(CATEGORIES_CONFIG).map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>

                        {/* Seletor Bolsão */}
                        <select
                          value={item.suggestedWallet}
                          onChange={(e) =>
                            handleChangeWallet(item.id, e.target.value as WalletSource)
                          }
                          className="px-2 py-1 bg-gray-900 border border-gray-800 rounded-lg text-[11px] text-gray-300 focus:outline-none focus:border-blue-500 hidden sm:block"
                        >
                          <option value="LIVRE">Livre</option>
                          <option value="BENEFICIO_VR_VA">VR/VA</option>
                          <option value="RESERVA_EMERGENCIA">Reserva</option>
                        </select>

                        {/* Valor */}
                        <span
                          className={`font-bold min-w-[80px] text-right ${
                            item.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {item.type === 'income' ? '+' : '-'}
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé e Ações */}
        {parseResult && (
          <div className="mt-5 pt-3 border-t border-gray-800 flex items-center justify-between">
            <button
              onClick={() => {
                setParseResult(null);
                setItems([]);
              }}
              className="text-xs text-gray-400 hover:text-white"
            >
              Escolher outro arquivo
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={selectedCount === 0}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>Importar {selectedCount} Selecionadas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
