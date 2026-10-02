export type WalletSource = 'LIVRE' | 'BENEFICIO_VR_VA' | 'RESERVA_EMERGENCIA';

export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'moradia_contas'
  | 'alimentacao_mercado'
  | 'restaurante_refeicao'
  | 'transporte'
  | 'saude'
  | 'lazer'
  | 'educacao'
  | 'investimentos'
  | 'outros';

export interface CategoryMetadata {
  id: TransactionCategory;
  name: string;
  color: string;
  allowedWallets: WalletSource[];
  defaultWallet: WalletSource;
  description: string;
  blockMessage?: string;
}

export const CATEGORIES_CONFIG: Record<TransactionCategory, CategoryMetadata> = {
  moradia_contas: {
    id: 'moradia_contas',
    name: 'Moradia & Contas',
    color: '#ef4444', // Vermelho
    allowedWallets: ['LIVRE'],
    defaultWallet: 'LIVRE',
    description: 'Aluguel, luz, água, internet, condomínio e boletos essenciais.',
    blockMessage: 'Regra de Não-Contaminação: Benefício VR/VA não pode ser usado para pagar contas e boletos.',
  },
  alimentacao_mercado: {
    id: 'alimentacao_mercado',
    name: 'Alimentação & Supermercado',
    color: '#f59e0b', // Âmbar
    allowedWallets: ['BENEFICIO_VR_VA', 'LIVRE'],
    defaultWallet: 'BENEFICIO_VR_VA',
    description: 'Compras de supermercado, feira e mantimentos.',
  },
  restaurante_refeicao: {
    id: 'restaurante_refeicao',
    name: 'Restaurantes & Lazer Gastronômico',
    color: '#eab308', // Amarelo
    allowedWallets: ['BENEFICIO_VR_VA', 'LIVRE'],
    defaultWallet: 'BENEFICIO_VR_VA',
    description: 'Almoços durante o expediente, jantares e lanches.',
  },
  transporte: {
    id: 'transporte',
    name: 'Transporte & Locomoção',
    color: '#3b82f6', // Azul
    allowedWallets: ['LIVRE'],
    defaultWallet: 'LIVRE',
    description: 'Uber, combustível, transporte público, manutenção de veículo.',
    blockMessage: 'Regra de Não-Contaminação: Benefício VR/VA não pode ser usado para transporte.',
  },
  saude: {
    id: 'saude',
    name: 'Saúde & Cuidados',
    color: '#10b981', // Verde esmeralda
    allowedWallets: ['LIVRE'],
    defaultWallet: 'LIVRE',
    description: 'Farmácia, consultas, convênio médico e cuidados pessoais.',
    blockMessage: 'Regra de Não-Contaminação: Benefício VR/VA não pode ser usado para saúde.',
  },
  lazer: {
    id: 'lazer',
    name: 'Lazer & Entretenimento',
    color: '#8b5cf6', // Roxo
    allowedWallets: ['LIVRE'],
    defaultWallet: 'LIVRE',
    description: 'Cinema, viagens, jogos, assinaturas e passeios.',
    blockMessage: 'Regra de Não-Contaminação: Benefício VR/VA não pode ser usado para lazer geral.',
  },
  educacao: {
    id: 'educacao',
    name: 'Educação & Livros',
    color: '#06b6d4', // Ciano
    allowedWallets: ['LIVRE'],
    defaultWallet: 'LIVRE',
    description: 'Faculdade, cursos técnicos, livros e certificações.',
    blockMessage: 'Regra de Não-Contaminação: Benefício VR/VA não pode ser usado para educação.',
  },
  investimentos: {
    id: 'investimentos',
    name: 'Investimentos & Reserva',
    color: '#6366f1', // Índigo
    allowedWallets: ['LIVRE', 'RESERVA_EMERGENCIA'],
    defaultWallet: 'LIVRE',
    description: 'Aportes financeiros, poupança e reservas.',
    blockMessage: 'Regra de Não-Contaminação: Benefício VR/VA não pode ser usado para investimentos.',
  },
  outros: {
    id: 'outros',
    name: 'Outras Despesas',
    color: '#9ca3af', // Cinza
    allowedWallets: ['LIVRE'],
    defaultWallet: 'LIVRE',
    description: 'Gastos diversos não categorizados.',
  },
};

export const WALLET_NAMES: Record<WalletSource, { name: string; description: string; badgeColor: string }> = {
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
 * Validador de compatibilidade entre categoria de gasto e fonte de recurso
 */
export function validateWalletCompatibility(
  category: TransactionCategory,
  wallet: WalletSource
): { valid: boolean; reason?: string } {
  const config = CATEGORIES_CONFIG[category];
  if (!config) {
    return { valid: true };
  }

  const isAllowed = config.allowedWallets.includes(wallet);
  if (!isAllowed) {
    return {
      valid: false,
      reason: config.blockMessage || `A categoria "${config.name}" não aceita pagamentos via "${WALLET_NAMES[wallet].name}".`,
    };
  }

  return { valid: true };
}
