import { describe, it, expect } from 'bun:test';
import { evaluateAnomalyDetection } from '@/lib/engine/anomalyDetection';
import { Transaction } from '@/types/finance';

describe('Motor de Detecção Estatística de Anomalias (Z-Score & IQR)', () => {
  const sampleTransactions: Transaction[] = [
    { id: '1', description: 'Restaurante', amount: 50, type: 'expense', category: 'restaurante_refeicao', wallet: 'BENEFICIO_VR_VA', date: '2026-10-01', status: 'completed' },
    { id: '2', description: 'Almoço', amount: 60, type: 'expense', category: 'restaurante_refeicao', wallet: 'BENEFICIO_VR_VA', date: '2026-10-02', status: 'completed' },
    { id: '3', description: 'Lanche', amount: 45, type: 'expense', category: 'restaurante_refeicao', wallet: 'BENEFICIO_VR_VA', date: '2026-10-03', status: 'completed' },
    { id: '4', description: 'Jantar', amount: 70, type: 'expense', category: 'restaurante_refeicao', wallet: 'BENEFICIO_VR_VA', date: '2026-10-04', status: 'completed' },
    { id: '5', description: 'Café', amount: 35, type: 'expense', category: 'restaurante_refeicao', wallet: 'BENEFICIO_VR_VA', date: '2026-10-05', status: 'completed' },
  ];

  it('deve classificar como risco BAIXO um valor alinhado com a média histórica', () => {
    const result = evaluateAnomalyDetection({
      proposal: {
        description: 'Almoço Executivo',
        amount: 55, // Média é ~52
        category: 'restaurante_refeicao',
        wallet: 'BENEFICIO_VR_VA',
      },
      historicalTransactions: sampleTransactions,
    });

    expect(result.risk).toBe('baixo');
    expect(result.zScore).toBeLessThan(1.2);
    expect(result.classification).toContain('Padrão Normal de Consumo');
  });

  it('deve classificar como risco ALTO (Outlier) um valor discrepante do histórico da categoria', () => {
    const result = evaluateAnomalyDetection({
      proposal: {
        description: 'Jantar Degustação Luxo',
        amount: 450, // Quase 9x a média!
        category: 'restaurante_refeicao',
        wallet: 'BENEFICIO_VR_VA',
      },
      historicalTransactions: sampleTransactions,
    });

    expect(result.risk).toBe('alto');
    expect(result.zScore).toBeGreaterThanOrEqual(2.5);
    expect(result.classification).toContain('Outlier');
    expect(result.explanation).toContain('maior que a média histórica');
  });
});
