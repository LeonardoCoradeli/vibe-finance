import {
  WalletBalances,
  BudgetLimit,
  FinancialGoal,
  validateWalletCompatibility,
  WALLET_NAMES,
  CATEGORIES_CONFIG,
  Category,
  Wallet,
} from '@/types/finance';
import { ExpenseProposal, LinearProgrammingResult } from './types';

interface LPInput {
  proposal: ExpenseProposal;
  balances: WalletBalances & Record<string, number>;
  monthlyIncome: number;
  monthlyExpense: number;
  categoryExpenses: Record<string, number>;
  budgets: BudgetLimit[];
  goals: FinancialGoal[];
  categories?: Category[];
  wallets?: Wallet[];
}

export function evaluateLinearProgramming(input: LPInput): LinearProgrammingResult {
  const { proposal, balances, monthlyIncome, monthlyExpense, categoryExpenses, budgets, goals, categories, wallets } = input;
  const violations: string[] = [];

  const walletObj = wallets?.find((w) => w.id === proposal.wallet);
  const walletName = walletObj?.name || WALLET_NAMES[proposal.wallet]?.name || proposal.wallet;

  const catObj = categories?.find((c) => c.id === proposal.category);
  const catName = catObj?.name || CATEGORIES_CONFIG[proposal.category]?.name || proposal.category;

  // 1. Verificação de Compatibilidade de Fonte (Blocklist)
  const comp = validateWalletCompatibility(proposal.category, proposal.wallet, categories);
  const compatibilityCheck = {
    ok: comp.valid,
    message: comp.valid
      ? `A fonte "${walletName}" é compatível com "${catName}".`
      : comp.reason || 'Incompatibilidade entre fonte e categoria.',
  };
  if (!comp.valid) {
    violations.push(compatibilityCheck.message);
  }

  // 2. Verificação de Saldo da Fonte (Solvência)
  let currentWalletBalance = 0;
  if (proposal.wallet in balances) {
    currentWalletBalance = (balances as any)[proposal.wallet] || 0;
  } else if (proposal.wallet === 'LIVRE') {
    currentWalletBalance = balances.livre;
  } else if (proposal.wallet === 'BENEFICIO_VR_VA') {
    currentWalletBalance = balances.beneficioVrVa;
  } else if (proposal.wallet === 'RESERVA_EMERGENCIA') {
    currentWalletBalance = balances.reserva;
  }

  const remainingWalletBalance = currentWalletBalance - proposal.amount;
  const isBalanceSufficient = remainingWalletBalance >= 0;
  const balanceCheck = {
    ok: isBalanceSufficient,
    currentBalance: currentWalletBalance,
    remainingBalance: remainingWalletBalance,
    message: isBalanceSufficient
      ? `Saldo suficiente na fonte: restará R$ ${remainingWalletBalance.toFixed(2)}.`
      : `Saldo insuficiente na fonte: faltam R$ ${Math.abs(remainingWalletBalance).toFixed(2)} no bolsão ${walletName}.`,
  };
  if (!isBalanceSufficient) {
    violations.push(balanceCheck.message);
  }

  // 3. Verificação de Teto Orçamentário da Categoria
  const categoryBudget = budgets.find((b) => b.category === proposal.category);
  const currentCategorySpent = categoryExpenses[proposal.category] || 0;
  let categoryRemainingMargin = 999999;
  let categoryCheckOk = true;
  let categoryMessage = 'Nenhum teto cadastrado para esta categoria.';

  if (categoryBudget) {
    const projectedCategorySpent = currentCategorySpent + proposal.amount;
    categoryRemainingMargin = categoryBudget.monthlyLimit - projectedCategorySpent;
    categoryCheckOk = categoryRemainingMargin >= 0;
    categoryMessage = categoryCheckOk
      ? `Dentro do teto mensal da categoria: margem restante de R$ ${categoryRemainingMargin.toFixed(2)}.`
      : `Estoura o teto da categoria em R$ ${Math.abs(categoryRemainingMargin).toFixed(2)} (Limite: R$ ${categoryBudget.monthlyLimit.toFixed(2)}, Projetado: R$ ${projectedCategorySpent.toFixed(2)}).`;

    if (!categoryCheckOk) {
      violations.push(categoryMessage);
    }
  }

  const categoryCheck = {
    ok: categoryCheckOk,
    currentSpent: currentCategorySpent,
    limit: categoryBudget ? categoryBudget.monthlyLimit : 0,
    remainingMargin: categoryRemainingMargin,
    message: categoryMessage,
  };

  // 4. Verificação de Metas de Economia Mensal
  const targetMonthlySavings = goals.reduce((acc, g) => acc + g.monthlyTarget, 0);
  const currentNetSavings = monthlyIncome - monthlyExpense;
  const projectedNetSavings = currentNetSavings - proposal.amount;
  const isSavingsGoalMet = projectedNetSavings >= targetMonthlySavings;
  const savingsGap = targetMonthlySavings - projectedNetSavings;

  const savingsGoalCheck = {
    ok: isSavingsGoalMet,
    targetSavings: targetMonthlySavings,
    projectedSavings: projectedNetSavings,
    message: isSavingsGoalMet
      ? `Mantém a meta de poupança mensal de R$ ${targetMonthlySavings.toFixed(2)} intacta.`
      : `Compromete a meta de poupança mensal em R$ ${savingsGap.toFixed(2)}.`,
  };
  if (!isSavingsGoalMet) {
    violations.push(savingsGoalCheck.message);
  }

  // Decisão Global de Viabilidade Matemática
  const viable = violations.length === 0;

  return {
    viable,
    violations,
    remainingWalletBalance,
    categoryRemainingMargin,
    savingsImpact: projectedNetSavings,
    details: {
      compatibilityCheck,
      balanceCheck,
      categoryCheck,
      savingsGoalCheck,
    },
  };
}
