import {
  WalletBalances,
  BudgetLimit,
  FinancialGoal,
  Transaction,
  Category,
  Wallet,
} from '@/types/finance';
import { ExpenseProposal, EvaluationReport } from './types';
import { evaluateLinearProgramming } from './linearProgramming';
import { evaluateAnomalyDetection } from './anomalyDetection';
import { evaluateSLM } from './slmEvaluator';

export * from './types';
export * from './linearProgramming';
export * from './anomalyDetection';
export * from './slmEvaluator';

interface FullEvaluationInput {
  proposal: ExpenseProposal;
  balances: WalletBalances & Record<string, number>;
  monthlyIncome: number;
  monthlyExpense: number;
  categoryExpenses: Record<string, number>;
  budgets: BudgetLimit[];
  goals: FinancialGoal[];
  historicalTransactions: Transaction[];
  categories?: Category[];
  wallets?: Wallet[];
}

export async function evaluateExpenseProposal(input: FullEvaluationInput): Promise<EvaluationReport> {
  const {
    proposal,
    balances,
    monthlyIncome,
    monthlyExpense,
    categoryExpenses,
    budgets,
    goals,
    historicalTransactions,
    categories,
    wallets,
  } = input;

  // 1. Executa Pesquisa Operacional (Determinística)
  const lpResult = evaluateLinearProgramming({
    proposal,
    balances,
    monthlyIncome,
    monthlyExpense,
    categoryExpenses,
    budgets,
    goals,
    categories,
    wallets,
  });

  // 2. Executa Detecção Estatística de Anomalias
  const anomalyResult = evaluateAnomalyDetection({
    proposal,
    historicalTransactions,
  });

  // 3. Executa Avaliação Semântica SLM (JSON Estruturado)
  const slmResult = await evaluateSLM({
    proposal,
    linearProgramming: lpResult,
    anomalyDetection: anomalyResult,
    goals,
  });

  // 4. Síntese da Recomendação Final
  let finalRecommendation: 'APROVADO' | 'ALERTA' | 'REPROVADO' = 'APROVADO';

  if (!lpResult.viable || slmResult.verdict === 'nao') {
    finalRecommendation = 'REPROVADO';
  } else if (anomalyResult.risk === 'alto') {
    finalRecommendation = 'ALERTA';
  }

  return {
    proposal,
    linearProgramming: lpResult,
    anomalyDetection: anomalyResult,
    slm: slmResult,
    finalRecommendation,
    timestamp: new Date().toISOString(),
  };
}
