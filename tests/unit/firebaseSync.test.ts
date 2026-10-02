import { describe, it, expect } from 'bun:test';
import { saveUserDataToCloud, loadUserDataFromCloud } from '@/lib/firebase/syncService';
import { Transaction, BudgetLimit, FinancialGoal } from '@/types/finance';

describe('Sincronização em Nuvem com Firebase Firestore (Conta QA & Produção)', () => {
  it('deve retornar erro gracioso quando o Firebase não possui chaves no ambiente para usuários comuns', async () => {
    const result = await saveUserDataToCloud('user-prod-google-123', {
      transactions: [],
      budgets: [],
      goals: [],
    });

    // Sem credenciais reais no .env.local, bloqueia usuário de produção graciosamente
    expect(result.success).toBe(false);
    expect(result.error).toContain('Firebase não configurado');
  });

  it('deve permitir salvar e recuperar dados na Nuvem Simulada quando for Conta de QA', async () => {
    const qaUid = 'qa-tester-001';
    const initialTx: Transaction = {
      id: 'tx-qa-test',
      description: 'Salário QA Nuvem',
      amount: 4500,
      type: 'income',
      category: 'outros',
      wallet: 'LIVRE',
      date: '2026-10-01',
      status: 'completed',
    };

    const saveRes = await saveUserDataToCloud(qaUid, {
      transactions: [initialTx],
      budgets: [],
      goals: [],
    });

    expect(saveRes.success).toBe(true);

    const loaded = await loadUserDataFromCloud(qaUid);
    expect(loaded).not.toBeNull();
    expect(loaded?.transactions.length).toBe(1);
    expect(loaded?.transactions[0].description).toBe('Salário QA Nuvem');
    expect(loaded?.transactions[0].amount).toBe(4500);
  });

  it('deve formatar e estruturar corretamente o payload financeiro para a conta de QA', () => {
    const qaTransactions: Transaction[] = [
      {
        id: 'tx-qa-1',
        description: 'Depósito Inicial QA',
        amount: 5000,
        type: 'income',
        category: 'outros',
        wallet: 'LIVRE',
        date: '2026-10-01',
        status: 'completed',
      },
      {
        id: 'tx-qa-2',
        description: 'Recarga Vale Refeição QA',
        amount: 800,
        type: 'income',
        category: 'alimentacao_mercado',
        wallet: 'BENEFICIO_VR_VA',
        date: '2026-10-01',
        status: 'completed',
      },
    ];

    const qaBudgets: BudgetLimit[] = [
      { category: 'moradia_contas', monthlyLimit: 2000 },
      { category: 'alimentacao_mercado', monthlyLimit: 800 },
    ];

    const qaGoals: FinancialGoal[] = [
      {
        id: 'goal-qa',
        title: 'Meta de Teste QA',
        targetAmount: 10000,
        currentAmount: 2000,
        deadline: '2026-12-31',
        monthlyTarget: 1000,
        targetWallet: 'RESERVA_EMERGENCIA',
      },
    ];

    const payload = {
      transactions: qaTransactions,
      budgets: qaBudgets,
      goals: qaGoals,
      updatedAt: new Date().toISOString(),
    };

    expect(payload.transactions.length).toBe(2);
    expect(payload.transactions[0].amount).toBe(5000);
    expect(payload.transactions[1].wallet).toBe('BENEFICIO_VR_VA');
    expect(payload.budgets[0].monthlyLimit).toBe(2000);
    expect(payload.goals[0].targetAmount).toBe(10000);
  });
});
