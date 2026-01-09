export type TransactionType = 'expense' | 'income' | 'transfer';

export type TagStyle = 'modern' | 'minimal';

export type AppTheme = 'zen' | 'midnight' | 'sunset' | 'ocean';

export type LayoutMode = 'mobile' | 'tablet';

export type AccountType = 'cash' | 'bank' | 'credit' | 'ewallet';

export type Language = 'en' | 'cn';

export type ChartType = 'bar' | 'line' | 'area';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  initialBalance: number;
  includeInNetWorth: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  type: 'expense' | 'income' | 'both';
  budgetLimit?: number; // Monthly budget limit
  subTags: string[]; // List of sub-tag names
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  accountId: string; // From Account
  toAccountId?: string; // For Transfers
  tags: string[]; 
  subTags?: Record<string, string>; // Map tagId -> subTagName
  date: number; 
  note?: string;
  images: string[];
  isConfirmed: boolean; // Reconciliation status
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  transactionData?: Partial<Transaction>; // If the AI suggests a transaction
  isAnalysis?: boolean;
}

export type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

// Clean, professional colors
export const TAG_COLORS = [
  'bg-slate-100 text-slate-700 border-slate-200',
  'bg-red-50 text-red-600 border-red-100',
  'bg-orange-50 text-orange-600 border-orange-100',
  'bg-amber-50 text-amber-600 border-amber-100',
  'bg-emerald-50 text-emerald-600 border-emerald-100',
  'bg-cyan-50 text-cyan-600 border-cyan-100',
  'bg-blue-50 text-blue-600 border-blue-100',
  'bg-indigo-50 text-indigo-600 border-indigo-100',
  'bg-violet-50 text-violet-600 border-violet-100',
  'bg-rose-50 text-rose-600 border-rose-100',
];

export const INITIAL_ACCOUNTS: Account[] = [
  { id: 'a1', name: 'Cash', type: 'cash', balance: 0, initialBalance: 0, includeInNetWorth: true },
  { id: 'a2', name: 'Card', type: 'bank', balance: 0, initialBalance: 0, includeInNetWorth: true },
  { id: 'a3', name: 'Credit', type: 'credit', balance: 0, initialBalance: 0, includeInNetWorth: true },
];

export const TAGS_PACK_TEXT: Tag[] = [
  { id: '1', name: 'Food', color: 'bg-orange-50 text-orange-600 border-orange-100', type: 'expense', budgetLimit: 500, subTags: ['Groceries', 'Dining Out', 'Snacks', 'Coffee'] },
  { id: '2', name: 'Transport', color: 'bg-blue-50 text-blue-600 border-blue-100', type: 'expense', budgetLimit: 200, subTags: ['Taxi', 'Bus', 'Fuel'] },
  { id: '3', name: 'Housing', color: 'bg-slate-50 text-slate-600 border-slate-100', type: 'expense', budgetLimit: 1000, subTags: ['Rent', 'Utilities'] },
  { id: '5', name: 'Salary', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', type: 'income', subTags: ['Bonus', 'Full-time'] },
];