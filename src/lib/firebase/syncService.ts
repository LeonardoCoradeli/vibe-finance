import { db, isFirebaseConfigured } from './config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Transaction, BudgetLimit, FinancialGoal, Wallet, Category } from '@/types/finance';

export interface UserFinancialData {
  transactions: Transaction[];
  budgets: BudgetLimit[];
  goals: FinancialGoal[];
  wallets?: Wallet[];
  categories?: Category[];
  categoryMappings?: Record<string, string>;
  updatedAt: string;
}

// Armazenamento em memória para ambiente de testes e QA quando o Firebase real não estiver configurado
const qaMemoryStore = new Map<string, UserFinancialData>();

export async function saveUserDataToCloud(
  uid: string,
  data: {
    transactions: Transaction[];
    budgets: BudgetLimit[];
    goals: FinancialGoal[];
    wallets?: Wallet[];
    categories?: Category[];
    categoryMappings?: Record<string, string>;
  }
): Promise<{ success: boolean; error?: string }> {
  // Se for uma conta de QA ou teste, persiste no localStorage do navegador ou Map em memória
  if (uid.startsWith('qa-') || uid.includes('qa')) {
    const payload: UserFinancialData = {
      transactions: data.transactions,
      budgets: data.budgets,
      goals: data.goals,
      wallets: data.wallets,
      categories: data.categories,
      categoryMappings: data.categoryMappings,
      updatedAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(`qa_cloud_db_${uid}`, JSON.stringify(payload));
      } catch (e) {
        console.warn('Falha ao salvar no localStorage da conta QA:', e);
      }
    }
    qaMemoryStore.set(uid, payload);
    return { success: true };
  }

  // Se as credenciais reais do Firebase estiverem configuradas, persiste no Cloud Firestore
  if (isFirebaseConfigured && db) {
    try {
      const userDocRef = doc(db, 'users', uid);
      const savePayload: any = {
        transactions: data.transactions,
        budgets: data.budgets,
        goals: data.goals,
        updatedAt: new Date().toISOString(),
      };
      if (data.wallets) savePayload.wallets = data.wallets;
      if (data.categories) savePayload.categories = data.categories;
      if (data.categoryMappings) savePayload.categoryMappings = data.categoryMappings;

      const savePromise = setDoc(userDocRef, savePayload, { merge: true });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                'Tempo limite ao contatar o Firestore. Verifique se o Cloud Firestore está ativado no Firebase Console.'
              )
            ),
          2500
        )
      );

      await Promise.race([savePromise, timeoutPromise]);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Erro ao sincronizar dados na nuvem.',
      };
    }
  }

  return { success: false, error: 'Firebase não configurado nas variáveis de ambiente.' };
}

export async function loadUserDataFromCloud(uid: string): Promise<UserFinancialData | null> {
  // Se for conta de QA, recupera do localStorage do navegador ou Map em memória
  if (uid.startsWith('qa-') || uid.includes('qa')) {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const item = window.localStorage.getItem(`qa_cloud_db_${uid}`);
        if (item) {
          return JSON.parse(item) as UserFinancialData;
        }
      } catch (e) {
        console.warn('Falha ao recuperar do localStorage da conta QA:', e);
      }
    }
    return qaMemoryStore.get(uid) || null;
  }

  // Se as credenciais reais do Firebase estiverem configuradas, carrega do Cloud Firestore
  if (isFirebaseConfigured && db) {
    try {
      const userDocRef = doc(db, 'users', uid);
      const snapPromise = getDoc(userDocRef);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                'Tempo limite ao buscar dados no Firestore. Verifique se o Cloud Firestore está ativado no Firebase Console.'
              )
            ),
          2500
        )
      );

      const snap = await Promise.race([snapPromise, timeoutPromise]);
      if (snap.exists()) {
        return snap.data() as UserFinancialData;
      }
      return null;
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      return null;
    }
  }

  return null;
}
