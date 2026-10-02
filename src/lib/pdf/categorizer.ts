import { TransactionCategory, TransactionType, WalletSource } from '@/types/finance';

interface CategorizationRule {
  keywords: string[];
  category: TransactionCategory;
  wallet: WalletSource;
  type?: TransactionType;
}

const RULES: CategorizationRule[] = [
  // Alimentação / VR
  {
    keywords: [
      'IFOOD',
      'RAPPI',
      'ZE DELIVERY',
      'MERCADO',
      'SUPERMERCADO',
      'PAO DE ACUCAR',
      'CARREFOUR',
      'ASSAI',
      'ATACADAO',
      'EXTRA',
      'HORTIFRUTI',
      'FEIRA',
      'PADARIA',
      'QUITANDA',
      'HIROTA',
      'SAO VICENTE',
    ],
    category: 'alimentacao_mercado',
    wallet: 'BENEFICIO_VR_VA',
    type: 'expense',
  },
  // Restaurante / Refeição
  {
    keywords: [
      'RESTAURANTE',
      'LANCHES',
      'BURGER',
      'MCDONALD',
      'BK ',
      'BURGER KING',
      'SUBWAY',
      'PIZZARIA',
      'CHURRASCARIA',
      'CAFE',
      'STARBUCKS',
      'OUTBACK',
      'HABIB',
      'GIRAFAS',
      'SPOLETO',
    ],
    category: 'restaurante_refeicao',
    wallet: 'BENEFICIO_VR_VA',
    type: 'expense',
  },
  // Moradia & Contas (LIVRE)
  {
    keywords: [
      'ENEL',
      'CPFL',
      'LIGHT',
      'SABESP',
      'SANEPAR',
      'COPASA',
      'CLARO',
      'VIVO',
      'TIM',
      'OI ',
      'NET ',
      'CONDOMINIO',
      'ALUGUEL',
      'IPTU',
      'LUZ',
      'AGUA',
      'GAS',
      'COMGAS',
      'QUINTA ANDAR',
      'LOFT',
    ],
    category: 'moradia_contas',
    wallet: 'LIVRE',
    type: 'expense',
  },
  // Transporte (LIVRE)
  {
    keywords: [
      'UBER',
      '99APP',
      '99 POP',
      '99TAXI',
      'POSTO',
      'SHELL',
      'IPIRANGA',
      'PETROBRAS',
      'ALE ',
      'SEM PARAR',
      'VELOE',
      'CONECTCAR',
      'METRO',
      'CPTM',
      'ESTAPAR',
      'PEDAGIO',
      'AUTOPISTA',
    ],
    category: 'transporte',
    wallet: 'LIVRE',
    type: 'expense',
  },
  // Saúde (LIVRE)
  {
    keywords: [
      'DROGASIL',
      'DROGA RAIA',
      'PAGUE MENOS',
      'FARMACIA',
      'DROGARIA',
      'HOSPITAL',
      'LABORATORIO',
      'FLEURY',
      'CONSULTORIO',
      'DENTISTA',
      'ODONTO',
      'CLINICA',
      'UNIMED',
      'AMIL',
      'SULAMERICA',
    ],
    category: 'saude',
    wallet: 'LIVRE',
    type: 'expense',
  },
  // Lazer (LIVRE)
  {
    keywords: [
      'NETFLIX',
      'SPOTIFY',
      'CINEMA',
      'CINEMARK',
      'UCI',
      'INGRESSO',
      'STEAM',
      'PLAYSTATION',
      'AMAZON PRIME',
      'DISNEY',
      'HOTEL',
      'AIRBNB',
      'BOOKING',
      'DECOLAR',
      'SHOW',
      'SYMPLA',
      'EVENTIM',
    ],
    category: 'lazer',
    wallet: 'LIVRE',
    type: 'expense',
  },
  // Educação (LIVRE)
  {
    keywords: [
      'UDEMY',
      'ALURA',
      'COURSERA',
      'FACULDADE',
      'UNIVERSIDADE',
      'ESCOLA',
      'LIVRARIA',
      'SARAIVA',
      'CULTURA',
      'KINDLE',
      'CURSO',
    ],
    category: 'educacao',
    wallet: 'LIVRE',
    type: 'expense',
  },
  // Investimentos (LIVRE)
  {
    keywords: [
      'APORTE',
      'TESOURO',
      'CDB',
      'XP INVESTIMENTOS',
      'BTG',
      'CLEAR',
      'RICO',
      'NU INVEST',
      'INTER DTVM',
      'BINANCE',
      'MERCADO BITCOIN',
    ],
    category: 'investimentos',
    wallet: 'LIVRE',
    type: 'expense',
  },
];

const INCOME_KEYWORDS = [
  'SALARIO',
  'TED RECEBIDA',
  'PIX RECEBIDO',
  'REMUNERACAO',
  'FOLHA DE PAGTO',
  'CREDITO EM CONTA',
  'DIVIDENDOS',
  'PROVENTOS',
  'TRANSFERENCIA RECEBIDA',
  'RESGATE',
  'ESTORNO',
];

export function categorizeTransactionLine(description: string, indicatedType?: TransactionType): {
  category: TransactionCategory;
  wallet: WalletSource;
  type: TransactionType;
  confidence: 'alta' | 'media' | 'baixa';
} {
  const upper = description.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 1. Verificar se é Entrada (Income)
  const isIncome =
    indicatedType === 'income' || INCOME_KEYWORDS.some((kw) => upper.includes(kw));

  if (isIncome) {
    // Checar se é crédito específico de benefício VR
    if (upper.includes('VALE REFEICAO') || upper.includes('VR') || upper.includes('ALIMENTACAO') || upper.includes('SODEXO') || upper.includes('ALELO') || upper.includes('TICKET')) {
      return {
        category: 'alimentacao_mercado',
        wallet: 'BENEFICIO_VR_VA',
        type: 'income',
        confidence: 'alta',
      };
    }

    return {
      category: 'outros',
      wallet: 'LIVRE',
      type: 'income',
      confidence: 'alta',
    };
  }

  // 2. Verificar regras de categorias para despesas
  for (const rule of RULES) {
    for (const kw of rule.keywords) {
      if (upper.includes(kw)) {
        return {
          category: rule.category,
          wallet: rule.wallet,
          type: 'expense',
          confidence: 'alta',
        };
      }
    }
  }

  // Fallback para despesas genéricas
  return {
    category: 'outros',
    wallet: 'LIVRE',
    type: indicatedType || 'expense',
    confidence: 'baixa',
  };
}
