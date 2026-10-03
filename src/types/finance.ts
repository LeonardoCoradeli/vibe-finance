export type WalletSource = 'LIVRE' | 'BENEFICIO_VR_VA' | 'RESERVA_EMERGENCIA' | string;

export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'moradia'
  | 'contas'
  | 'alimentacao'
  | 'moradia_contas'
  | 'alimentacao_mercado'
  | 'restaurante_refeicao'
  | 'transporte'
  | 'saude'
  | 'lazer'
  | 'educacao'
  | 'investimentos'
  | 'outros'
  | string;

export interface Wallet {
  id: string;
  name: string;
  color: string;
  description?: string;
  isFixed?: boolean;
  isHidden?: boolean;
  badgeColor?: string;
}

export const DEFAULT_WALLETS: Wallet[] = [
  {
    id: 'LIVRE',
    name: 'Saldo Livre (Conta Corrente)',
    color: '#3b82f6',
    description: 'Dinheiro desimpedido para qualquer finalidade.',
    isFixed: true,
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  {
    id: 'BENEFICIO_VR_VA',
    name: 'Benefício VR / VA',
    color: '#f59e0b',
    description: 'Exclusivo para alimentação e refeições. Não paga contas.',
    isFixed: true,
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  {
    id: 'RESERVA_EMERGENCIA',
    name: 'Reserva de Emergência',
    color: '#8b5cf6',
    description: 'Fundo protegido para imprevistos.',
    isFixed: true,
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
];

export interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
  blockedWallets: string[]; // Blocklist: Quais bolsões NÃO podem ser usados para pagar esta categoria
  isFixed?: boolean;
}

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'moradia',
    name: 'Moradia',
    color: '#ef4444',
    description: 'Aluguel, condomínio, IPTU e moradia.',
    blockedWallets: ['BENEFICIO_VR_VA', 'RESERVA_EMERGENCIA'],
    isFixed: true,
  },
  {
    id: 'contas',
    name: 'Contas',
    color: '#f97316',
    description: 'Luz, água, gás, internet e boletos essenciais.',
    blockedWallets: ['BENEFICIO_VR_VA', 'RESERVA_EMERGENCIA'],
    isFixed: true,
  },
  {
    id: 'alimentacao',
    name: 'Alimentação',
    color: '#10b981',
    description: 'Supermercado, restaurantes, feira e refeições.',
    blockedWallets: ['RESERVA_EMERGENCIA'],
    isFixed: true,
  },
];

export interface CategoryMetadata {
  id: TransactionCategory;
  name: string;
  color: string;
  allowedWallets: WalletSource[];
  defaultWallet: WalletSource;
  description: string;
  blockMessage?: string;
}

export const CATEGORIES_CONFIG: Record<string, CategoryMetadata> = {
  moradia: {
    id: 'moradia',
    name: 'Moradia',
    color: '#ef4444',
    allowedWallets: ['LIVRE'],
    defaultWallet: 'LIVRE',
    description: 'Aluguel, condomínio, IPTU e moradia.',
    blockMessage: 'Regra de Não-Contaminação: Benefício VR/VA não pode ser usado para pagar moradia.',
  },
  contas: {
    id: 'contas',
    name: 'Contas',
    color: '#f97316',
    allowedWallets: ['LIVRE'],
    defaultWallet: 'LIVRE',
    description: 'Luz, água, internet e boletos essenciais.',
    blockMessage: 'Regra de Não-Contaminação: Benefício VR/VA não pode ser usado para pagar contas e boletos.',
  },
  alimentacao: {
    id: 'alimentacao',
    name: 'Alimentação',
    color: '#10b981',
    allowedWallets: ['BENEFICIO_VR_VA', 'LIVRE'],
    defaultWallet: 'BENEFICIO_VR_VA',
    description: 'Supermercado, restaurantes, feira e refeições.',
  },
  moradia_contas: {
    id: 'moradia_contas',
    name: 'Moradia & Contas',
    color: '#ef4444',
    allowedWallets: ['LIVRE'],
    defaultWallet: 'LIVRE',
    description: 'Aluguel, luz, água, internet, condomínio e boletos essenciais.',
    blockMessage: 'Regra de Não-Contaminação: Benefício VR/VA não pode ser usado para pagar contas e boletos.',
  },
  alimentacao_mercado: {
    id: 'alimentacao_mercado',
    name: 'Alimentação',
    color: '#10b981',
    allowedWallets: ['BENEFICIO_VR_VA', 'LIVRE'],
    defaultWallet: 'BENEFICIO_VR_VA',
    description: 'Compras de supermercado, feira e mantimentos.',
  },
  restaurante_refeicao: {
    id: 'restaurante_refeicao',
    name: 'Alimentação',
    color: '#10b981',
    allowedWallets: ['BENEFICIO_VR_VA', 'LIVRE'],
    defaultWallet: 'BENEFICIO_VR_VA',
    description: 'Almoços, refeições e delivery.',
  },
};

export const WALLET_NAMES: Record<string, { name: string; description: string; badgeColor: string }> = {
  LIVRE: {
    name: 'Saldo Livre (Conta Corrente)',
    description: 'Dinheiro desimpedido para qualquer finalidade.',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  BENEFICIO_VR_VA: {
    name: 'Benefício VR / VA',
    description: 'Exclusivo para alimentação e refeições. Não paga contas.',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  RESERVA_EMERGENCIA: {
    name: 'Reserva de Emergência',
    description: 'Fundo protegido para imprevistos.',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
};

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  wallet: WalletSource;
  date: string; // YYYY-MM-DD
  status: 'completed' | 'pending';
  notes?: string;
}

export interface BudgetLimit {
  category: TransactionCategory;
  monthlyLimit: number;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  monthlyTarget: number;
  targetWallet: WalletSource;
}

export interface WalletBalances {
  total: number;
  livre: number;
  beneficioVrVa: number;
  reserva: number;
  availableForBills: number;
  availableForFood: number;
}

/**
 * Validador de compatibilidade entre categoria de gasto e fonte de recurso com suporte a Blocklist dinâmica
 */
export function validateWalletCompatibility(
  category: Category | string,
  wallet: WalletSource,
  categoriesList: Category[] = DEFAULT_CATEGORIES
): { valid: boolean; reason?: string } {
  let catObj: Category | undefined;

  if (typeof category === 'object' && category !== null) {
    catObj = category;
  } else {
    catObj = categoriesList.find((c) => c.id === category);

    // Compatibilidade com IDs antigos
    if (!catObj) {
      if (category === 'moradia_contas') {
        catObj = categoriesList.find((c) => c.id === 'moradia') || categoriesList.find((c) => c.id === 'contas');
      } else if (category === 'alimentacao_mercado' || category === 'restaurante_refeicao') {
        catObj = categoriesList.find((c) => c.id === 'alimentacao');
      }
    }
  }

  if (!catObj) {
    return { valid: true };
  }

  // Verifica se o bolsão está na lista de bloqueados desta categoria
  const isBlocked = catObj.blockedWallets?.includes(wallet);
  if (isBlocked) {
    let walletName = WALLET_NAMES[wallet]?.name;
    if (!walletName) {
      walletName = wallet === 'BENEFICIO_VR_VA' ? 'Benefício VR/VA' : wallet === 'RESERVA_EMERGENCIA' ? 'Reserva de Emergência' : wallet;
    }

    if (wallet === 'BENEFICIO_VR_VA' && (catObj.id === 'moradia' || catObj.id === 'contas' || catObj.id === 'moradia_contas')) {
      return {
        valid: false,
        reason: 'Regra de Não-Contaminação: Benefício VR/VA não pode ser usado para pagar contas e boletos.',
      };
    }

    return {
      valid: false,
      reason: `Regra de Não-Contaminação: ${walletName} não pode ser usado para pagar ${catObj.name}.`,
    };
  }

  return { valid: true };
}
