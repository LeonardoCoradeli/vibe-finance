import { describe, it, expect } from 'bun:test';
import { categorizeTransactionLine } from '@/lib/pdf/categorizer';

describe('Autocategorizador Heurístico de Extratos em PDF', () => {
  it('deve categorizar iFood como Alimentação e bolsão BENEFICIO_VR_VA', () => {
    const res = categorizeTransactionLine('PG *IFOOD BRASIL SAO PAULO');
    expect(res.category).toBe('alimentacao');
    expect(res.wallet).toBe('BENEFICIO_VR_VA');
    expect(res.type).toBe('expense');
  });

  it('deve categorizar Enel / Luz como Contas e bolsão LIVRE', () => {
    const res = categorizeTransactionLine('DEBITO AUTOMATICO ENEL DISTRIBUICAO');
    expect(res.category).toBe('contas');
    expect(res.wallet).toBe('LIVRE');
    expect(res.type).toBe('expense');
  });

  it('deve categorizar Uber como Transporte e bolsão LIVRE', () => {
    const res = categorizeTransactionLine('UBER *TRIP HELP.UBER.COM');
    expect(res.category).toBe('transporte');
    expect(res.wallet).toBe('LIVRE');
  });

  it('deve identificar crédito de Salário como Entrada e bolsão LIVRE', () => {
    const res = categorizeTransactionLine('TED RECEBIDA - SALARIO MENSAL');
    expect(res.type).toBe('income');
    expect(res.wallet).toBe('LIVRE');
  });
});
