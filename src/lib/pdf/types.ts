import { TransactionCategory, TransactionType, WalletSource } from '@/types/finance';

export interface ParsedStatementItem {
  id: string;
  rawLine: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  type: TransactionType;
  suggestedCategory: TransactionCategory;
  suggestedWallet: WalletSource;
  selected: boolean;
  confidence: 'alta' | 'media' | 'baixa';
}

export interface StatementParseResult {
  items: ParsedStatementItem[];
  totalCredits: number;
  totalDebits: number;
  rawTextPreview: string;
  errors: string[];
}
