import { Transaction } from '@/types/finance';
import { ExpenseProposal, AnomalyDetectionResult } from './types';

interface AnomalyInput {
  proposal: ExpenseProposal;
  historicalTransactions: Transaction[];
}

function quantile(sortedArr: number[], q: number): number {
  if (sortedArr.length === 0) return 0;
  const pos = (sortedArr.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sortedArr[base + 1] !== undefined) {
    return sortedArr[base] + rest * (sortedArr[base + 1] - sortedArr[base]);
  }
  return sortedArr[base];
}

export function evaluateAnomalyDetection(input: AnomalyInput): AnomalyDetectionResult {
  const { proposal, historicalTransactions } = input;

  // Filtrar despesas na mesma categoria
  let sample = historicalTransactions
    .filter((t) => t.type === 'expense' && t.category === proposal.category)
    .map((t) => t.amount);

  // Se houver menos de 3 amostras na categoria, complementar com todas as despesas para compor amostra estatística
  if (sample.length < 3) {
    sample = historicalTransactions.filter((t) => t.type === 'expense').map((t) => t.amount);
  }

  // Se ainda assim não houver histórico suficiente, usar baseline padrão
  if (sample.length === 0) {
    sample = [50, 100, 150];
  }

  const sampleCount = sample.length;
  const sum = sample.reduce((acc, val) => acc + val, 0);
  const mean = sum / sampleCount;

  // Desvio padrão amostral
  const variance =
    sample.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (sampleCount > 1 ? sampleCount - 1 : 1);
  const stdDev = Math.max(Math.sqrt(variance), 1.0); // Previne divisão por zero

  // Z-Score
  const zScore = (proposal.amount - mean) / stdDev;

  // Cálculo de Quartis e IQR
  const sorted = [...sample].sort((a, b) => a - b);
  const q1 = quantile(sorted, 0.25);
  const q3 = quantile(sorted, 0.75);
  const iqrVal = Math.max(q3 - q1, 1.0);
  const upperFence = q3 + 1.5 * iqrVal;

  let risk: 'baixo' | 'medio' | 'alto' = 'baixo';
  let classification = 'Transação Típica e Segura';
  let explanation = '';

  const ratio = mean > 0 ? (proposal.amount / mean).toFixed(1) : '1.0';

  if (zScore >= 2.5 || proposal.amount > upperFence * 1.5) {
    risk = 'alto';
    classification = 'Outlier Severo / Despesa Atípica';
    explanation = `O valor de R$ ${proposal.amount.toFixed(2)} é ${ratio}x maior que a média histórica (R$ ${mean.toFixed(2)}) e ultrapassa o limite estatístico de segurança de R$ ${upperFence.toFixed(2)} (Z-Score: ${zScore.toFixed(2)}).`;
  } else if (zScore >= 1.2 || proposal.amount > upperFence) {
    risk = 'medio';
    classification = 'Despesa Moderada / Acima do Padrão';
    explanation = `O valor de R$ ${proposal.amount.toFixed(2)} está ${ratio}x acima da média (R$ ${mean.toFixed(2)}), exigindo cautela (Z-Score: ${zScore.toFixed(2)}).`;
  } else {
    risk = 'baixo';
    classification = 'Padrão Normal de Consumo';
    explanation = `O valor de R$ ${proposal.amount.toFixed(2)} está alinhado com a média habitual de R$ ${mean.toFixed(2)} para esta categoria (Z-Score: ${zScore.toFixed(2)}).`;
  }

  return {
    zScore: Number(zScore.toFixed(2)),
    mean: Number(mean.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2)),
    sampleCount,
    iqr: {
      q1: Number(q1.toFixed(2)),
      q3: Number(q3.toFixed(2)),
      iqr: Number(iqrVal.toFixed(2)),
      upperFence: Number(upperFence.toFixed(2)),
    },
    risk,
    classification,
    explanation,
  };
}
