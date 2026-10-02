'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import {
  Transaction,
  BudgetLimit,
  FinancialGoal,
  WalletBalances,
  TransactionCategory,
  WalletSource,
  validateWalletCompatibility,
} from '@/types/finance';
import { useAuth } from '@/lib/firebase/authContext';
import { loadUserDataFromCloud, saveUserDataToCloud } from '@/lib/firebase/syncService';

interface FinanceContextType {
  transactions: Transaction[];
  budgets: BudgetLimit[];
  goals: FinancialGoal[];
  selectedMonth: string; // YYYY-MM
  setSelectedMonth: (month: string) => void;
  balances: WalletBalances;
  monthlyTransactions: Transaction[];
  monthlyIncome: number;
  monthlyExpense: number;
  netSavings: number;
  categoryExpenses: Record<TransactionCategory, number>;
  addTransaction: (tx: Omit<Transaction, 'id'>) => { success: boolean; error?: string; transaction?: Transaction };
  updateTransaction: (id: string, tx: Partial<Transaction>) => { success: boolean; error?: string };
  deleteTransaction: (id: string) => void;
  setBudgetLimit: (category: TransactionCategory, monthlyLimit: number) => void;
  addGoal: (goal: Omit<FinancialGoal, 'id'>) => FinancialGoal;
  updateGoal: (id: string, goal: Partial<FinancialGoal>) => void;
  deleteGoal: (id: string) => void;
  resetData: () => void;
  loadDemoData: () => void;
  isSyncing: boolean;
  syncToCloudNow: () => Promise<{ success: boolean; error?: string }>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    description: 'Salário Mensal Líquido',
    amount: 6800.0,
    type: 'income',
    category: 'outros',
    wallet: 'LIVRE',
    date: '2026-10-01',
    status: 'completed',
  },
  {
    id: 'tx-2',
    description: 'Crédito Vale Refeição / Alimentação (VR/VA)',
    amount: 1200.0,
    type: 'income',
    category: 'alimentacao_mercado',
    wallet: 'BENEFICIO_VR_VA',
    date: '2026-10-01',
    status: 'completed',
  },
  {
    id: 'tx-3',
    description: 'Aluguel & Condomínio Residencial',
    amount: 2200.0,
    type: 'expense',
    category: 'moradia_contas',
    wallet: 'LIVRE',
    date: '2026-10-05',
    status: 'completed',
  },
  {
    id: 'tx-4',
    description: 'Supermercado Mensal Pão de Açúcar',
    amount: 640.8,
    type: 'expense',
    category: 'alimentacao_mercado',
    wallet: 'BENEFICIO_VR_VA',
    date: '2026-10-08',
    status: 'completed',
  },
];

const DEMO_BUDGETS: BudgetLimit[] = [
  { category: 'moradia_contas', monthlyLimit: 2600.0 },
  { category: 'alimentacao_mercado', monthlyLimit: 900.0 },
  { category: 'lazer', monthlyLimit: 600.0 },
];

const DEMO_GOALS: FinancialGoal[] = [
  {
    id: 'goal-1',
    title: 'Reserva de Emergência (6 Meses)',
    targetAmount: 25000.0,
    currentAmount: 14500.0,
    deadline: '2026-12-31',
    monthlyTarget: 1000.0,
    targetWallet: 'RESERVA_EMERGENCIA',
  },
];

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // Inicia 100% LIMPO por padrão (Zero State)
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<BudgetLimit[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
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
          } else if (isMounted && transactions.length > 0) {
            // Se o usuário já tinha dados em memória ao logar e a nuvem está vazia, persiste na nuvem
            await saveUserDataToCloud(user.uid, {
              transactions,
              budgets,
              goals,
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
    });
    setIsSyncing(false);
    return res;
  }, [user, transactions, budgets, goals]);

  // Salvar em nuvem automaticamente em caso de mutação se usuário estiver logado
  const triggerBackgroundSave = useCallback(
    (newTx: Transaction[], newBudgets: BudgetLimit[], newGoals: FinancialGoal[]) => {
      if (user?.uid) {
        saveUserDataToCloud(user.uid, {
          transactions: newTx,
          budgets: newBudgets,
          goals: newGoals,
        }).catch((err) => console.warn('Erro ao salvar em segundo plano:', err));
      }
    },
    [user]
  );

  // Cálculo de saldos acumulados globais segregados por bolsão
  const balances: WalletBalances = useMemo(() => {
    let livre = 0;
    let beneficioVrVa = 0;
    let reserva = 0;

    for (const tx of transactions) {
      const multiplier = tx.type === 'income' ? 1 : -1;
      const value = tx.amount * multiplier;

      if (tx.wallet === 'LIVRE') {
        livre += value;
      } else if (tx.wallet === 'BENEFICIO_VR_VA') {
        beneficioVrVa += value;
      } else if (tx.wallet === 'RESERVA_EMERGENCIA') {
        reserva += value;
      }
    }

    return {
      total: livre + beneficioVrVa + reserva,
      livre,
      beneficioVrVa,
      reserva,
      availableForBills: livre,
      availableForFood: livre + beneficioVrVa,
    };
  }, [transactions]);

  // Transações do mês selecionado
  const monthlyTransactions = useMemo(() => {
    return transactions.filter((tx) => tx.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Entradas e saídas do mês selecionado
  const { monthlyIncome, monthlyExpense, categoryExpenses } = useMemo(() => {
    let income = 0;
    let expense = 0;
    const catMap: Record<TransactionCategory, number> = {
      moradia_contas: 0,
      alimentacao_mercado: 0,
      restaurante_refeicao: 0,
      transporte: 0,
      saude: 0,
      lazer: 0,
      educacao: 0,
      investimentos: 0,
      outros: 0,
    };

    for (const tx of monthlyTransactions) {
      if (tx.type === 'income') {
        income += tx.amount;
      } else {
        expense += tx.amount;
        if (catMap[tx.category] !== undefined) {
          catMap[tx.category] += tx.amount;
        }
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
      const validation = validateWalletCompatibility(tx.category, tx.wallet);
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
      const validation = validateWalletCompatibility(merged.category, merged.wallet);
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

  const resetData = () => {
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    triggerBackgroundSave([], [], []);
  };

  const loadDemoData = () => {
    setTransactions(DEMO_TRANSACTIONS);
    setBudgets(DEMO_BUDGETS);
    setGoals(DEMO_GOALS);
    triggerBackgroundSave(DEMO_TRANSACTIONS, DEMO_BUDGETS, DEMO_GOALS);
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets,
        goals,
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
