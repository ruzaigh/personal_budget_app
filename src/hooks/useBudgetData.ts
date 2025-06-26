import { useState, useEffect, useCallback } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";

import { useFirebase } from "./useFirebase";
import type {
  BudgetData,
  Expense,
  IncomeSource,
  SavingsAccount,
} from "../types/budget.types.ts";

interface UseBudgetDataReturn extends BudgetData {
  setBaseIncome: (income: number) => void;
  setAdditionalIncomes: (incomes: IncomeSource[]) => void;
  setExpenses: (expenses: Expense[]) => void;
  setSavingsAccounts: (accounts: SavingsAccount[]) => void;
  setMonthlyAllocatedToSavings: (amount: number) => void;
  loading: boolean;
  error: string | null;
}

const INITIAL_BUDGET_DATA: BudgetData = {
  baseIncome: 0,
  additionalIncomes: [],
  expenses: [],
  savingsAccounts: [],
  monthlyAllocatedToSavings: 0,
};

export const useBudgetData = (): UseBudgetDataReturn => {
  const { db, user } = useFirebase();
  const [budgetData, setBudgetData] = useState<BudgetData>(INITIAL_BUDGET_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from Firestore
  useEffect(() => {
    const loadBudgetData = async () => {
      if (!db || !user) return;

      setLoading(true);
      setError(null);

      try {
        const docRef = doc(db, `users/${user.uid}/budgetData/main`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as BudgetData;
          setBudgetData({
            baseIncome: data.baseIncome || 0,
            additionalIncomes: data.additionalIncomes || [],
            expenses: data.expenses || [],
            savingsAccounts: data.savingsAccounts || [],
            monthlyAllocatedToSavings: data.monthlyAllocatedToSavings || 0,
          });
        }
      } catch (err: any) {
        setError(`Failed to load budget data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadBudgetData();
    } else if (!user && !loading) {
      setLoading(false);
    }
  }, [db, user]);

  // Save data to Firestore with debouncing
  const saveBudgetData = useCallback(
    async (data: BudgetData) => {
      if (!db || !user || loading) return;

      try {
        const docRef = doc(db, `users/${user.uid}/budgetData/main`);
        await setDoc(docRef, data);
      } catch (err: any) {
        setError(`Failed to save budget data: ${err.message}`);
      }
    },
    [db, user, loading],
  );

  // Debounced save effect
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (!loading && user) {
        await saveBudgetData(budgetData);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [budgetData, saveBudgetData, loading, user]);

  const setBaseIncome = (income: number) => {
    setBudgetData((prev) => ({ ...prev, baseIncome: income }));
  };

  const setAdditionalIncomes = (incomes: IncomeSource[]) => {
    setBudgetData((prev) => ({ ...prev, additionalIncomes: incomes }));
  };

  const setExpenses = (expenses: Expense[]) => {
    setBudgetData((prev) => ({ ...prev, expenses }));
  };

  const setSavingsAccounts = (accounts: SavingsAccount[]) => {
    setBudgetData((prev) => ({ ...prev, savingsAccounts: accounts }));
  };

  const setMonthlyAllocatedToSavings = (amount: number) => {
    setBudgetData((prev) => ({ ...prev, monthlyAllocatedToSavings: amount }));
  };

  return {
    ...budgetData,
    setBaseIncome,
    setAdditionalIncomes,
    setExpenses,
    setSavingsAccounts,
    setMonthlyAllocatedToSavings,
    loading,
    error,
  };
};
