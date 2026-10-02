'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  Transaction,
  BudgetLimit,
  FinancialGoal,
  WalletBalances,
  TransactionCategory,
  WalletSource,
  validateWalletCompatibility,
} from '@/types/finance';

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
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const INITIAL_DEMO_TRANSACTIONS: Transaction[] = [
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
    description: 'Energia Elétrica (Enel)',
    amount: 185.4,
    type: 'expense',
    category: 'moradia_contas',
    wallet: 'LIVRE',
    date: '2026-10-07',
    status: 'completed',
  },
  {
    id: 'tx-5',
    description: 'Supermercado Mensal Pão de Açúcar',
    amount: 640.8,
    type: 'expense',
    category: 'alimentacao_mercado',
    wallet: 'BENEFICIO_VR_VA',
    date: '2026-10-08',
    status: 'completed',
  },
  {
    id: 'tx-6',
    description: 'Almoço de Trabalho com Colegas',
    amount: 62.0,
    type: 'expense',
    category: 'restaurante_refeicao',
    wallet: 'BENEFICIO_VR_VA',
    date: '2026-10-10',
    status: 'completed',
  },
  {
    id: 'tx-7',
    description: 'Combustível Posto Shell',
    amount: 210.0,
    type: 'expense',
    category: 'transporte',
    wallet: 'LIVRE',
    date: '2026-10-12',
    status: 'completed',
  },
  {
    id: 'tx-8',
    description: 'Farmácia Drogasil (Vitaminas & Cuidados)',
    amount: 135.5,
    type: 'expense',
    category: 'saude',
    wallet: 'LIVRE',
    date: '2026-10-14',
    status: 'completed',
  },
  {
    id: 'tx-9',
    description: 'Cinema & Jantar Final de Semana',
    amount: 180.0,
    type: 'expense',
    category: 'lazer',
    wallet: 'LIVRE',
    date: '2026-10-16',
    status: 'completed',
  },
  {
    id: 'tx-10',
    description: 'Aporte Reserva de Oportunidade',
    amount: 800.0,
    type: 'expense',
    category: 'investimentos',
    wallet: 'LIVRE',
    date: '2026-10-18',
    status: 'completed',
  },
];

const INITIAL_BUDGETS: BudgetLimit[] = [
  { category: 'moradia_contas', monthlyLimit: 2600.0 },
  { category: 'alimentacao_mercado', monthlyLimit: 900.0 },
  { category: 'restaurante_refeicao', monthlyLimit: 400.0 },
  { category: 'transporte', monthlyLimit: 500.0 },
  { category: 'lazer', monthlyLimit: 600.0 },
  { category: 'saude', monthlyLimit: 300.0 },
  { category: 'investimentos', monthlyLimit: 1500.0 },
];

const INITIAL_GOALS: FinancialGoal[] = [
  {
    id: 'goal-1',
    title: 'Reserva de Emergência (6 Meses)',
    targetAmount: 25000.0,
    currentAmount: 14500.0,
    deadline: '2026-12-31',
    monthlyTarget: 1000.0,
    targetWallet: 'RESERVA_EMERGENCIA',
  },
  {
    id: 'goal-2',
    title: 'Viagem de Férias Fim de Ano',
    targetAmount: 5000.0,
    currentAmount: 2200.0,
    deadline: '2026-12-15',
    monthlyTarget: 600.0,
    targetWallet: 'LIVRE',
  },
];

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_DEMO_TRANSACTIONS);
  const [budgets, setBudgets] = useState<BudgetLimit[]>(INITIAL_BUDGETS);
  const [goals, setGoals] = useState<FinancialGoal[]>(INITIAL_GOALS);
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');

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
    // Validar regra de não-contaminação se for despesa
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

    setTransactions((prev) => [newTx, ...prev]);
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

    setTransactions((prev) => prev.map((t) => (t.id === id ? merged : t)));
    return { success: true };
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const setBudgetLimit = (category: TransactionCategory, monthlyLimit: number) => {
    setBudgets((prev) => {
      const filtered = prev.filter((b) => b.category !== category);
      return [...filtered, { category, monthlyLimit }];
    });
  };

  const addGoal = (goal: Omit<FinancialGoal, 'id'>) => {
    const newGoal: FinancialGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
    };
    setGoals((prev) => [...prev, newGoal]);
    return newGoal;
  };

  const updateGoal = (id: string, goal: Partial<FinancialGoal>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...goal } : g)));
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const resetData = () => {
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
  };

  const loadDemoData = () => {
    setTransactions(INITIAL_DEMO_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setGoals(INITIAL_GOALS);
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
