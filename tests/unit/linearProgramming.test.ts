import { describe, it, expect } from 'bun:test';
import { evaluateLinearProgramming } from '@/lib/engine/linearProgramming';

describe('Motor de Pesquisa Operacional (Programação Linear)', () => {
  const baseBalances = {
    total: 5000,
    livre: 3500,
    beneficioVrVa: 1000,
    reserva: 500,
    availableForBills: 3500,
    availableForFood: 4500,
  };

  const baseBudgets = [
    { category: 'lazer' as const, monthlyLimit: 600 },
    { category: 'moradia_contas' as const, monthlyLimit: 2500 },
  ];

  const baseGoals = [
    {
      id: 'g-1',
      title: 'Reserva Mensal',
      targetAmount: 10000,
      currentAmount: 2000,
      deadline: '2026-12-31',
      monthlyTarget: 500,
      targetWallet: 'RESERVA_EMERGENCIA' as const,
    },
  ];

  it('deve aprovar gasto viável com saldo e dentro do teto da categoria', () => {
    const result = evaluateLinearProgramming({
      proposal: {
        description: 'Cinema e Pipoca',
        amount: 150,
        category: 'lazer',
        wallet: 'LIVRE',
      },
      balances: baseBalances,
      monthlyIncome: 6000,
      monthlyExpense: 2000,
      categoryExpenses: { lazer: 100 },
      budgets: baseBudgets,
      goals: baseGoals,
    });

    expect(result.viable).toBe(true);
    expect(result.violations.length).toBe(0);
    expect(result.remainingWalletBalance).toBe(3350);
  });

  it('deve reprovar gasto que estoura o teto orçamentário da categoria', () => {
    const result = evaluateLinearProgramming({
      proposal: {
        description: 'Show Internacional VIP',
        amount: 800,
        category: 'lazer',
        wallet: 'LIVRE',
      },
      balances: baseBalances,
      monthlyIncome: 6000,
      monthlyExpense: 2000,
      categoryExpenses: { lazer: 100 }, // Já gastou 100, teto é 600. Proposta de 800 estoura em 300!
      budgets: baseBudgets,
      goals: baseGoals,
    });

    expect(result.viable).toBe(false);
    expect(result.violations.some((v) => v.includes('Estoura o teto da categoria'))).toBe(true);
  });

  it('deve reprovar gasto quando o saldo da fonte selecionada for insuficiente', () => {
    const result = evaluateLinearProgramming({
      proposal: {
        description: 'Viagem de Luxo',
        amount: 4000, // Saldo livre é 3500
        category: 'lazer',
        wallet: 'LIVRE',
      },
      balances: baseBalances,
      monthlyIncome: 6000,
      monthlyExpense: 2000,
      categoryExpenses: {},
      budgets: [],
      goals: [],
    });

    expect(result.viable).toBe(false);
    expect(result.violations.some((v) => v.includes('Saldo insuficiente'))).toBe(true);
  });

  it('deve reprovar despesa de Contas usando bolsão VR por violação de regra', () => {
    const result = evaluateLinearProgramming({
      proposal: {
        description: 'Conta de Energia',
        amount: 200,
        category: 'moradia_contas',
        wallet: 'BENEFICIO_VR_VA',
      },
      balances: baseBalances,
      monthlyIncome: 6000,
      monthlyExpense: 2000,
      categoryExpenses: {},
      budgets: [],
      goals: [],
    });

    expect(result.viable).toBe(false);
    expect(result.violations.some((v) => v.includes('Regra de Não-Contaminação'))).toBe(true);
  });
});
