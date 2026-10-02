import { TransactionCategory, WalletSource } from '@/types/finance';

export interface ExpenseProposal {
  description: string;
  amount: number;
  category: TransactionCategory;
  wallet: WalletSource;
  notes?: string;
}

export interface LinearProgrammingResult {
  viable: boolean;
  violations: string[];
  remainingWalletBalance: number;
  categoryRemainingMargin: number;
  savingsImpact: number;
  details: {
    compatibilityCheck: { ok: boolean; message: string };
    balanceCheck: { ok: boolean; currentBalance: number; remainingBalance: number; message: string };
    categoryCheck: { ok: boolean; currentSpent: number; limit: number; remainingMargin: number; message: string };
    savingsGoalCheck: { ok: boolean; targetSavings: number; projectedSavings: number; message: string };
  };
}

export interface AnomalyDetectionResult {
  zScore: number;
  mean: number;
  stdDev: number;
  sampleCount: number;
  iqr: {
    q1: number;
    q3: number;
    iqr: number;
    upperFence: number;
  };
  risk: 'baixo' | 'medio' | 'alto';
  classification: string;
  explanation: string;
}

export interface SLMResult {
  verdict: 'sim' | 'nao';
  impactScore: number; // 0 a 100
  justification: string;
  tradeOff: string;
  engineUsed: 'gemini_slm' | 'local_heuristics';
}

export interface EvaluationReport {
  proposal: ExpenseProposal;
  linearProgramming: LinearProgrammingResult;
  anomalyDetection: AnomalyDetectionResult;
  slm: SLMResult;
  finalRecommendation: 'APROVADO' | 'ALERTA' | 'REPROVADO';
  timestamp: string;
}
