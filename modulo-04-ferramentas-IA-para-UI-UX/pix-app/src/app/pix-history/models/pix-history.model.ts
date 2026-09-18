export type TransactionType = 'received' | 'sent';

export type TransactionCategory = 'transfer' | 'qr-code' | 'payment';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  date: string;
  category?: TransactionCategory;
}

export type HistoryStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface HistoryState {
  transactions: Transaction[];
  status: HistoryStatus;
  relatorioSolicitado: boolean;
}
