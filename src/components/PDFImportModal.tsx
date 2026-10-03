'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { parseBankStatementPDF, ParsedStatementItem, StatementParseResult } from '@/lib/pdf';
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
  Plus,
  BookmarkCheck,
} from 'lucide-react';
import { CategoryManagementModal } from './CategoryManagementModal';

interface PDFImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PDFImportModal({ isOpen, onClose }: PDFImportModalProps) {
  const { addTransaction, categories, wallets, categoryMappings, saveCategoryMapping } = useFinance();

  const [loading, setLoading] = useState(false);
  const [parseResult, setParseResult] = useState<StatementParseResult | null>(null);
  const [items, setItems] = useState<ParsedStatementItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Modal para criar nova categoria na hora se o usuário quiser
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [targetPendingCategory, setTargetPendingCategory] = useState<string | null>(null);

  // Mapeamentos pendentes para categorias do extrato que não existem no app
  const [pendingMappings, setPendingMappings] = useState<Record<string, string>>({});
  const [rememberMappings, setRememberMappings] = useState<Record<string, boolean>>({});

  // Bolsões visíveis
  const visibleWallets = wallets.filter((w) => !w.isHidden);

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

      // Normaliza categorias dos itens com base no mapeamento existente ou nas categorias ativas
      const mappedItems = result.items.map((item) => {
        let cat = item.suggestedCategory;

        // Verifica se há mapeamento prévio salvo na memória
        if (categoryMappings[cat.toLowerCase()]) {
          cat = categoryMappings[cat.toLowerCase()];
        } else if (cat === 'moradia_contas') {
          cat = 'contas';
        } else if (cat === 'alimentacao_mercado' || cat === 'restaurante_refeicao') {
          cat = 'alimentacao';
        }

        return {
          ...item,
          suggestedCategory: cat,
        };
      });

      setItems(mappedItems);

      // Detecta categorias que não existem na lista oficial do usuário
      const detectedCats = Array.from(new Set(mappedItems.map((i) => i.suggestedCategory)));
      const unmapped = detectedCats.filter((c) => !categories.some((cat) => cat.id === c));

      const initialPending: Record<string, string> = {};
      const initialRemember: Record<string, boolean> = {};
      unmapped.forEach((u) => {
        initialPending[u] = categories[0]?.id || 'contas';
        initialRemember[u] = true;
      });

      setPendingMappings(initialPending);
      setRememberMappings(initialRemember);

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

  const handleChangeCategory = (id: string, newCat: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, suggestedCategory: newCat } : item))
    );
  };

  const handleChangeWallet = (id: string, newWallet: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, suggestedWallet: newWallet } : item))
    );
  };

  const applyMappingForCategory = (detectedCat: string, targetCatId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.suggestedCategory === detectedCat ? { ...item, suggestedCategory: targetCatId } : item
      )
    );

    if (rememberMappings[detectedCat]) {
      saveCategoryMapping(detectedCat, targetCatId);
    }

    setPendingMappings((prev) => {
      const copy = { ...prev };
      delete copy[detectedCat];
      return copy;
    });
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
  const unmappedCategories = Object.keys(pendingMappings);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
        <div className="relative w-full max-w-3xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl p-5 sm:p-7 max-h-[90vh] overflow-y-auto flex flex-col justify-between">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2.5 text-blue-400 mb-1">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <FileUp className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Importador de Extrato Bancário em PDF</h3>
                <p className="text-xs text-gray-400">
                  Carregue seu extrato bancário para categorização automática inteligente.
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Área de Upload (arrastar ou clicar) */}
            {!parseResult && (
              <div className="mt-6 border-2 border-dashed border-gray-700 hover:border-blue-500/60 rounded-3xl p-8 text-center transition-all bg-gray-950/40 hover:bg-gray-800/30">
                <input
                  type="file"
                  id="pdf-upload-input"
                  accept=".pdf,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="pdf-upload-input"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-md">
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {loading ? 'Extraindo e categorizando linhas...' : 'Clique para selecionar o PDF do extrato'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Compatível com Nubank, Inter, Itaú, Bradesco, Santander e Caixa.
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Mapeamento Inteligente de Categorias Encontradas (Q14 - Opção C) */}
            {parseResult && unmappedCategories.length > 0 && (
              <div className="mt-5 p-4 bg-amber-950/20 border border-amber-500/30 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <BookmarkCheck className="w-4 h-4" />
                  <span>Categorias Detectadas no Extrato</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Identificamos termos no seu extrato que ainda não estão associados às suas categorias. 
                  Você pode associá-los a uma categoria existente ou criar uma nova categoria agora:
                </p>

                <div className="space-y-2">
                  {unmappedCategories.map((unmappedCat) => (
                    <div
                      key={unmappedCat}
                      className="p-2.5 bg-gray-950/80 border border-gray-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <span className="text-xs font-bold text-white capitalize">{unmappedCat}</span>

                      <div className="flex items-center gap-2 flex-wrap">
                        <select
                          value={pendingMappings[unmappedCat] || ''}
                          onChange={(e) =>
                            setPendingMappings((prev) => ({ ...prev, [unmappedCat]: e.target.value }))
                          }
                          className="bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1 text-xs text-white"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              Associar a: {c.name}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => {
                            setTargetPendingCategory(unmappedCat);
                            setIsCategoryModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-medium flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3 text-emerald-400" />
                          <span>Criar Categoria</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            applyMappingForCategory(unmappedCat, pendingMappings[unmappedCat])
                          }
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                        >
                          Confirmar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tabela de Revisão e Confirmação de Itens */}
            {parseResult && (
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleAll(selectedCount !== items.length)}
                      className="text-xs font-medium text-gray-400 hover:text-white flex items-center gap-1.5 transition"
                    >
                      {selectedCount === items.length ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-500" />
                      )}
                      <span>Selecionar Todos ({selectedCount}/{items.length})</span>
                    </button>
                  </div>

                  <span className="text-xs text-gray-500">
                    {items.length} lançamentos encontrados no extrato
                  </span>
                </div>

                <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        item.selected
                          ? 'bg-gray-950/80 border-gray-800 hover:border-gray-700'
                          : 'bg-gray-950/30 border-gray-800/40 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleToggleItem(item.id)}
                          className="mt-0.5 text-gray-400 hover:text-white"
                        >
                          {item.selected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-600" />
                          )}
                        </button>

                        <div>
                          <p className="text-xs font-bold text-white tracking-wide">{item.description}</p>
                          <span className="text-[10px] text-gray-500">{formatDateBR(item.date)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        {/* Seletor de Categoria */}
                        <select
                          value={item.suggestedCategory}
                          onChange={(e) => handleChangeCategory(item.id, e.target.value)}
                          className="bg-gray-900 border border-gray-800 rounded-xl px-2.5 py-1 text-xs text-gray-300"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>

                        {/* Seletor de Bolsão */}
                        <select
                          value={item.suggestedWallet}
                          onChange={(e) => handleChangeWallet(item.id, e.target.value)}
                          className="bg-gray-900 border border-gray-800 rounded-xl px-2.5 py-1 text-xs text-gray-300"
                        >
                          {visibleWallets.map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.name}
                            </option>
                          ))}
                        </select>

                        {/* Valor */}
                        <span
                          className={`text-xs font-bold min-w-[80px] text-right ${
                            item.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rodapé com Botão de Confirmação */}
          {parseResult && (
            <div className="pt-4 border-t border-gray-800 flex items-center justify-between mt-4">
              <button
                type="button"
                onClick={() => {
                  setParseResult(null);
                  setItems([]);
                }}
                className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white"
              >
                Trocar Arquivo
              </button>

              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={selectedCount === 0}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
              >
                Confirmar Importação de {selectedCount} Lançamento(s)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal para criar categoria rápida vinda do extrato */}
      <CategoryManagementModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setTargetPendingCategory(null);
        }}
        onCreated={(newCat) => {
          if (targetPendingCategory) {
            applyMappingForCategory(targetPendingCategory, newCat.id);
          }
          setIsCategoryModalOpen(false);
          setTargetPendingCategory(null);
        }}
      />
    </>
  );
}
