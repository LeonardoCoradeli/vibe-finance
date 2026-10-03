'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import {
  Transaction,
  BudgetLimit,
  FinancialGoal,
  WalletBalances,
  TransactionCategory,
  WalletSource,
  Wallet,
  Category,
  DEFAULT_WALLETS,
  DEFAULT_CATEGORIES,
  validateWalletCompatibility,
} from '@/types/finance';
import { useAuth } from '@/lib/firebase/authContext';
import { loadUserDataFromCloud, saveUserDataToCloud } from '@/lib/firebase/syncService';

interface FinanceContextType {
  transactions: Transaction[];
  budgets: BudgetLimit[];
  goals: FinancialGoal[];
  wallets: Wallet[];
  categories: Category[];
  categoryMappings: Record<string, string>;
  selectedMonth: string; // YYYY-MM
  setSelectedMonth: (month: string) => void;
  balances: WalletBalances & Record<string, number>;
  monthlyTransactions: Transaction[];
  monthlyIncome: number;
  monthlyExpense: number;
  netSavings: number;
  categoryExpenses: Record<string, number>;
  addTransaction: (tx: Omit<Transaction, 'id'>) => { success: boolean; error?: string; transaction?: Transaction };
  updateTransaction: (id: string, tx: Partial<Transaction>) => { success: boolean; error?: string };
  deleteTransaction: (id: string) => void;
  setBudgetLimit: (category: TransactionCategory, monthlyLimit: number) => void;
  addGoal: (goal: Omit<FinancialGoal, 'id'>) => FinancialGoal;
  updateGoal: (id: string, goal: Partial<FinancialGoal>) => void;
  deleteGoal: (id: string) => void;
  addWallet: (wallet: Omit<Wallet, 'id' | 'isFixed'>) => Wallet;
  updateWallet: (id: string, updates: Partial<Wallet>) => void;
  deleteWallet: (id: string) => { success: boolean; error?: string };
  toggleWalletVisibility: (id: string) => void;
  addCategory: (category: Omit<Category, 'id' | 'isFixed'>) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => { success: boolean; error?: string };
  saveCategoryMapping: (keyword: string, categoryId: string) => void;
  resetData: () => void;
  loadDemoData: () => void;
  isSyncing: boolean;
  syncToCloudNow: () => Promise<{ success: boolean; error?: string }>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // Inicia 100% LIMPO por padrão (Zero State)
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<BudgetLimit[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>(DEFAULT_WALLETS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [categoryMappings, setCategoryMappings] = useState<Record<string, string>>({});
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Sincronização automática quando o usuário faz login com conta Google / Firebase
  useEffect(() => {
    let isMounted = true;

    async function handleUserSync() {
      if (user?.uid) {
        setIsSyncing(true);
        try {
          const cloudData = await loadUserDataFromCloud(user.uid);
          if (isMounted && cloudData) {
            if (cloudData.transactions && cloudData.transactions.length > 0) {
              setTransactions(cloudData.transactions);
            }
            if (cloudData.budgets && cloudData.budgets.length > 0) {
              setBudgets(cloudData.budgets);
            }
            if (cloudData.goals && cloudData.goals.length > 0) {
              setGoals(cloudData.goals);
            }
            if (cloudData.wallets && cloudData.wallets.length > 0) {
              setWallets(cloudData.wallets);
            }
            if (cloudData.categories && cloudData.categories.length > 0) {
              setCategories(cloudData.categories);
            }
            if (cloudData.categoryMappings) {
              setCategoryMappings(cloudData.categoryMappings);
            }
          } else if (isMounted && transactions.length > 0) {
            await saveUserDataToCloud(user.uid, {
              transactions,
              budgets,
              goals,
              wallets,
              categories,
              categoryMappings,
            });
          }
        } catch (error) {
          console.error('Erro na sincronização com nuvem:', error);
        } finally {
          if (isMounted) setIsSyncing(false);
        }
      } else {
        // Ao deslogar (voltar ao Modo Convidado), reinicia a memória no Zero State limpo
        if (isMounted) {
          setTransactions([]);
          setBudgets([]);
          setGoals([]);
          setWallets(DEFAULT_WALLETS);
          setCategories(DEFAULT_CATEGORIES);
          setCategoryMappings({});
        }
      }
    }

    handleUserSync();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Função para salvar imediatamente na nuvem
  const syncToCloudNow = useCallback(async () => {
    if (!user?.uid) {
      return { success: false, error: 'Usuário não conectado ao Firebase.' };
    }
    setIsSyncing(true);
    const res = await saveUserDataToCloud(user.uid, {
      transactions,
      budgets,
      goals,
      wallets,
      categories,
      categoryMappings,
    });
    setIsSyncing(false);
    return res;
  }, [user, transactions, budgets, goals, wallets, categories, categoryMappings]);

  // Salvar em nuvem automaticamente em segundo plano
  const triggerBackgroundSave = useCallback(
    (
      newTx: Transaction[],
      newBudgets: BudgetLimit[],
      newGoals: FinancialGoal[],
      newWallets: Wallet[] = wallets,
      newCategories: Category[] = categories,
      newMappings: Record<string, string> = categoryMappings
    ) => {
      if (user?.uid) {
        saveUserDataToCloud(user.uid, {
          transactions: newTx,
          budgets: newBudgets,
          goals: newGoals,
          wallets: newWallets,
          categories: newCategories,
          categoryMappings: newMappings,
        }).catch((err) => console.warn('Erro ao salvar em segundo plano:', err));
      }
    },
    [user, wallets, categories, categoryMappings]
  );

  // Cálculo de saldos acumulados dinâmicos por bolsão
  const balances = useMemo(() => {
    const b: Record<string, number> = {};
    wallets.forEach((w) => {
      b[w.id] = 0;
    });

    for (const tx of transactions) {
      const multiplier = tx.type === 'income' ? 1 : -1;
      const value = tx.amount * multiplier;
      if (b[tx.wallet] === undefined) {
        b[tx.wallet] = 0;
      }
      b[tx.wallet] += value;
    }

    const livre = b['LIVRE'] || 0;
    const beneficioVrVa = b['BENEFICIO_VR_VA'] || 0;
    const reserva = b['RESERVA_EMERGENCIA'] || 0;

    let total = 0;
    Object.values(b).forEach((val) => {
      total += val;
    });

    return {
      ...b,
      total,
      livre,
      beneficioVrVa,
      reserva,
      availableForBills: livre,
      availableForFood: livre + beneficioVrVa,
    } as WalletBalances & Record<string, number>;
  }, [wallets, transactions]);

  // Transações do mês selecionado
  const monthlyTransactions = useMemo(() => {
    return transactions.filter((tx) => tx.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Entradas e saídas do mês selecionado
  const { monthlyIncome, monthlyExpense, categoryExpenses } = useMemo(() => {
    let income = 0;
    let expense = 0;
    const catMap: Record<string, number> = {};

    for (const tx of monthlyTransactions) {
      if (tx.type === 'income') {
        income += tx.amount;
      } else {
        expense += tx.amount;
        catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
      }
    }

    return {
      monthlyIncome: income,
      monthlyExpense: expense,
      categoryExpenses: catMap,
    };
  }, [monthlyTransactions]);

  const netSavings = monthlyIncome - monthlyExpense;

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    if (tx.type === 'expense') {
      const validation = validateWalletCompatibility(tx.category, tx.wallet, categories);
      if (!validation.valid) {
        return { success: false, error: validation.reason };
      }
    }

    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };

    const updated = [newTx, ...transactions];
    setTransactions(updated);
    triggerBackgroundSave(updated, budgets, goals);
    return { success: true, transaction: newTx };
  };

  const updateTransaction = (id: string, updatedFields: Partial<Transaction>) => {
    const existing = transactions.find((t) => t.id === id);
    if (!existing) {
      return { success: false, error: 'Transação não encontrada.' };
    }

    const merged = { ...existing, ...updatedFields };
    if (merged.type === 'expense') {
      const validation = validateWalletCompatibility(merged.category, merged.wallet, categories);
      if (!validation.valid) {
        return { success: false, error: validation.reason };
      }
    }

    const updated = transactions.map((t) => (t.id === id ? merged : t));
    setTransactions(updated);
    triggerBackgroundSave(updated, budgets, goals);
    return { success: true };
  };

  const deleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    triggerBackgroundSave(updated, budgets, goals);
  };

  const setBudgetLimit = (category: TransactionCategory, monthlyLimit: number) => {
    const filtered = budgets.filter((b) => b.category !== category);
    const updated = [...filtered, { category, monthlyLimit }];
    setBudgets(updated);
    triggerBackgroundSave(transactions, updated, goals);
  };

  const addGoal = (goal: Omit<FinancialGoal, 'id'>) => {
    const newGoal: FinancialGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
    };
    const updated = [...goals, newGoal];
    setGoals(updated);
    triggerBackgroundSave(transactions, budgets, updated);
    return newGoal;
  };

  const updateGoal = (id: string, goal: Partial<FinancialGoal>) => {
    const updated = goals.map((g) => (g.id === id ? { ...g, ...goal } : g));
    setGoals(updated);
    triggerBackgroundSave(transactions, budgets, updated);
  };

  const deleteGoal = (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    triggerBackgroundSave(transactions, budgets, updated);
  };

  // Gerenciamento de Bolsões
  const addWallet = (walletData: Omit<Wallet, 'id' | 'isFixed'>) => {
    const slug = walletData.name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_');
    const id = `wallet_${slug}_${Date.now().toString(36)}`;

    const newWallet: Wallet = {
      ...walletData,
      id,
      isFixed: false,
      isHidden: false,
    };

    const updated = [...wallets, newWallet];
    setWallets(updated);
    triggerBackgroundSave(transactions, budgets, goals, updated, categories);
    return newWallet;
  };

  const updateWallet = (id: string, updates: Partial<Wallet>) => {
    const updated = wallets.map((w) => (w.id === id ? { ...w, ...updates } : w));
    setWallets(updated);
    triggerBackgroundSave(transactions, budgets, goals, updated, categories);
  };

  const deleteWallet = (id: string) => {
    const wallet = wallets.find((w) => w.id === id);
    if (!wallet) return { success: false, error: 'Bolsão não encontrado.' };

    if (wallet.isFixed) {
      return {
        success: false,
        error: 'Bolsões nativos de fábrica não podem ser excluídos. Você pode ocultá-los visualmente.',
      };
    }

    const hasTx = transactions.some((t) => t.wallet === id);
    if (hasTx) {
      return {
        success: false,
        error: 'Não é possível excluir este bolsão pois existem transações registradas nele. Reatribua ou exclua as transações primeiro.',
      };
    }

    const updated = wallets.filter((w) => w.id !== id);
    setWallets(updated);
    triggerBackgroundSave(transactions, budgets, goals, updated, categories);
    return { success: true };
  };

  const toggleWalletVisibility = (id: string) => {
    const updated = wallets.map((w) => (w.id === id ? { ...w, isHidden: !w.isHidden } : w));
    setWallets(updated);
    triggerBackgroundSave(transactions, budgets, goals, updated, categories);
  };

  // Gerenciamento de Categorias
  const addCategory = (categoryData: Omit<Category, 'id' | 'isFixed'>) => {
    const slug = categoryData.name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_');
    const id = `cat_${slug}_${Date.now().toString(36)}`;

    const newCategory: Category = {
      ...categoryData,
      id,
      isFixed: false,
      blockedWallets: categoryData.blockedWallets || [],
    };

    const updated = [...categories, newCategory];
    setCategories(updated);
    triggerBackgroundSave(transactions, budgets, goals, wallets, updated);
    return newCategory;
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    const updated = categories.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setCategories(updated);
    triggerBackgroundSave(transactions, budgets, goals, wallets, updated);
  };

  const deleteCategory = (id: string) => {
    const category = categories.find((c) => c.id === id);
    if (!category) return { success: false, error: 'Categoria não encontrada.' };

    if (category.isFixed) {
      return {
        success: false,
        error: 'Categorias de fábrica não podem ser excluídas.',
      };
    }

    const hasTx = transactions.some((t) => t.category === id);
    if (hasTx) {
      return {
        success: false,
        error: 'Não é possível excluir esta categoria pois existem transações vinculadas a ela. Reclassifique ou remova as transações primeiro.',
      };
    }

    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    triggerBackgroundSave(transactions, budgets, goals, wallets, updated);
    return { success: true };
  };

  const saveCategoryMapping = (keyword: string, categoryId: string) => {
    const updatedMappings = { ...categoryMappings, [keyword.toLowerCase().trim()]: categoryId };
    setCategoryMappings(updatedMappings);
    triggerBackgroundSave(transactions, budgets, goals, wallets, categories, updatedMappings);
  };

  const resetData = () => {
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    triggerBackgroundSave([], [], []);
  };

  const loadDemoData = () => {
    const demoTx: Transaction[] = [
      {
        id: 'tx-1',
        description: 'Salário Mensal Líquido',
        amount: 6800.0,
        type: 'income',
        category: 'contas',
        wallet: 'LIVRE',
        date: '2026-10-01',
        status: 'completed',
      },
      {
        id: 'tx-2',
        description: 'Crédito Vale Refeição / Alimentação (VR/VA)',
        amount: 1200.0,
        type: 'income',
        category: 'alimentacao',
        wallet: 'BENEFICIO_VR_VA',
        date: '2026-10-01',
        status: 'completed',
      },
      {
        id: 'tx-3',
        description: 'Aluguel Residencial',
        amount: 2200.0,
        type: 'expense',
        category: 'moradia',
        wallet: 'LIVRE',
        date: '2026-10-05',
        status: 'completed',
      },
      {
        id: 'tx-4',
        description: 'Supermercado Mensal',
        amount: 640.8,
        type: 'expense',
        category: 'alimentacao',
        wallet: 'BENEFICIO_VR_VA',
        date: '2026-10-08',
        status: 'completed',
      },
    ];
    setTransactions(demoTx);
    triggerBackgroundSave(demoTx, budgets, goals);
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets,
        goals,
        wallets,
        categories,
        categoryMappings,
        selectedMonth,
        setSelectedMonth,
        balances,
        monthlyTransactions,
        monthlyIncome,
        monthlyExpense,
        netSavings,
        categoryExpenses,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        setBudgetLimit,
        addGoal,
        updateGoal,
        deleteGoal,
        addWallet,
        updateWallet,
        deleteWallet,
        toggleWalletVisibility,
        addCategory,
        updateCategory,
        deleteCategory,
        saveCategoryMapping,
        resetData,
        loadDemoData,
        isSyncing,
        syncToCloudNow,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance deve ser utilizado dentro de um FinanceProvider');
  }
  return context;
}
