import { useMemo } from "react";
import { useFirebase } from "./hooks/useFirebase";
import { useBudgetData } from "./hooks/useBudgetData";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";
import { ErrorAlert } from "./components/ui/ErrorAlert";
import { SummaryCards } from "./components/SummaryCards";
import { IncomeSection } from "./components/IncomeSection";
import { ExpenseSection } from "./components/ExpenseSection";
import { SavingsSection } from "./components/SavingsSection";

function App() {
  const {
    user,
    loading: firebaseLoading,
    error: firebaseError,
  } = useFirebase();
  const {
    baseIncome,
    additionalIncomes,
    expenses,
    savingsAccounts,
    monthlyAllocatedToSavings,
    setBaseIncome,
    setAdditionalIncomes,
    setExpenses,
    setSavingsAccounts,
    setMonthlyAllocatedToSavings,
    loading: budgetLoading,
    error: budgetError,
  } = useBudgetData();

  const loading = firebaseLoading || budgetLoading;
  const error = firebaseError || budgetError;

  const calculations = useMemo(() => {
    const totalIncome =
      baseIncome +
      additionalIncomes.reduce((acc, income) => acc + income.amount, 0);
    const totalExpenses = expenses.reduce(
      (acc, expense) => acc + expense.amount,
      0,
    );
    const moneyAvailableBeforeSavings = totalIncome - totalExpenses;
    const finalNetBalance =
      moneyAvailableBeforeSavings - monthlyAllocatedToSavings;
    const totalSavingsBalance = savingsAccounts.reduce(
      (acc, account) => acc + account.balance,
      0,
    );

    return {
      totalIncome,
      totalExpenses,
      moneyAvailableBeforeSavings,
      finalNetBalance,
      totalSavingsBalance,
    };
  }, [
    baseIncome,
    additionalIncomes,
    expenses,
    savingsAccounts,
    monthlyAllocatedToSavings,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 font-inter antialiased">
      {/* Tailwind CSS CDN and Font Link - move to index.html for production */}
      <script src="https://cdn.tailwindcss.com"></script>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <style>{`
                body {
                    font-family: 'Inter', sans-serif;
                }
            `}</style>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-gray-900 mb-10 leading-tight tracking-tight">
          Personal Budget <span className="text-blue-600">Tracker</span>
        </h1>

        {loading && <LoadingSpinner message="Loading your budget data..." />}

        {error && <ErrorAlert error={error} />}

        {/* Display User ID for debugging/multi-user context */}
        {user && (
          <div className="text-center text-sm text-gray-600 mb-4">
            Your User ID:{" "}
            <span className="font-mono bg-gray-200 px-2 py-1 rounded-md">
              {user.uid}
            </span>
          </div>
        )}

        {!loading && (
          <>
            <SummaryCards
              totalIncome={calculations.totalIncome}
              totalExpenses={calculations.totalExpenses}
              remainingBalance={calculations.finalNetBalance}
            />

            <IncomeSection
              baseIncome={baseIncome}
              setBaseIncome={setBaseIncome}
              additionalIncomes={additionalIncomes}
              setAdditionalIncomes={setAdditionalIncomes}
            />

            <ExpenseSection expenses={expenses} setExpenses={setExpenses} />

            <SavingsSection
              moneyAvailableBeforeSavings={
                calculations.moneyAvailableBeforeSavings
              }
              savingsAccounts={savingsAccounts}
              setSavingsAccounts={setSavingsAccounts}
              monthlyAllocatedToSavings={monthlyAllocatedToSavings}
              setMonthlyAllocatedToSavings={setMonthlyAllocatedToSavings}
              totalSavingsAccountBalance={calculations.totalSavingsBalance}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
