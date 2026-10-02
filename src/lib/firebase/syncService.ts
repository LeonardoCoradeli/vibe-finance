import { db, isFirebaseConfigured } from './config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Transaction, BudgetLimit, FinancialGoal } from '@/types/finance';

export interface UserFinancialData {
  transactions: Transaction[];
  budgets: BudgetLimit[];
  goals: FinancialGoal[];
  updatedAt: string;
}

export async function saveUserDataToCloud(
  uid: string,
  data: {
    transactions: Transaction[];
    budgets: BudgetLimit[];
    goals: FinancialGoal[];
  }
): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseConfigured || !db) {
    return { success: false, error: 'Firebase não configurado nas variáveis de ambiente.' };
  }

  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(
      userDocRef,
      {
        transactions: data.transactions,
        budgets: data.budgets,
        goals: data.goals,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Erro ao sincronizar dados na nuvem.' };
  }
}

export async function loadUserDataFromCloud(uid: string): Promise<UserFinancialData | null> {
  if (!isFirebaseConfigured || !db) {
    return null;
  }

  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserFinancialData;
    }
    return null;
  } catch (error) {
    console.error('Erro ao carregar dados do usuário:', error);
    return null;
  }
}
