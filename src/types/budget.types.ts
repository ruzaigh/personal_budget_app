export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
}

export interface SavingsAccount {
  id: string;
  name: string;
  balance: number;
  target: number;
}

export interface BudgetData {
  baseIncome: number;
  additionalIncomes: IncomeSource[];
  expenses: Expense[];
  savingsAccounts: SavingsAccount[];
  monthlyAllocatedToSavings: number;
}
