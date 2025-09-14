
export type Transaction = {
  id: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  accountId: string;
};

export type Budget = {
  id: string;
  categoryId: string;
  limit: number;
};

export type Account = {
  id: string;
  name: string;
  type: 'bank' | 'cash' | 'credit-card' | 'debit-card' | 'paypal' | 'zelle' | 'cash-app' | 'custom';
  initialBalance: number;
  balance: number;
};

export type Category = {
  id: string;
  name: string;
  type: 'income' | 'expense';
};
