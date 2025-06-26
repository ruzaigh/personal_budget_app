import React, { useState, useMemo } from "react";
import type { Expense } from "../types/budget.types";
import { EXPENSE_CATEGORIES } from "../constants/expense-categories";
import { generateId, validateAmount, formatCurrency } from "../utils/helper.ts";
import { FormInput } from "./ui/FormInput";
import { Button } from "./ui/Button";

interface ExpenseSectionProps {
  expenses: Expense[];
  setExpenses: (expenses: Expense[]) => void;
}

export const ExpenseSection: React.FC<ExpenseSectionProps> = ({
  expenses,
  setExpenses,
}) => {
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpenseCategory, setNewExpenseCategory] = useState(
    EXPENSE_CATEGORIES[0],
  );

  const totalExpenses = useMemo(() => {
    return expenses.reduce((acc, expense) => acc + expense.amount, 0);
  }, [expenses]);

  const handleAddExpense = () => {
    const amount = validateAmount(newExpenseAmount);
    if (newExpenseName.trim() && amount) {
      setExpenses([
        ...expenses,
        {
          id: generateId(),
          name: newExpenseName.trim(),
          amount,
          category: newExpenseCategory,
        },
      ]);
      setNewExpenseName("");
      setNewExpenseAmount("");
    }
  };

  const handleRemoveExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-6 w-full border border-gray-200">
      <h2 className="text-2xl font-bold mb-5 text-gray-800 border-b pb-3 border-gray-100">
        Expense Management
      </h2>

      <h3 className="text-xl font-semibold mb-4 text-gray-700">
        Monthly Recurring Expenses
      </h3>
      <div className="flex flex-col sm:flex-row gap-3 mb-4 items-end">
        <FormInput
          type="text"
          value={newExpenseName}
          onChange={setNewExpenseName}
          placeholder="Expense Name (e.g., Rent)"
          className="flex-grow"
        />
        <FormInput
          type="number"
          value={newExpenseAmount}
          onChange={setNewExpenseAmount}
          placeholder="Amount"
          className="w-full sm:w-1/3"
        />
        <FormInput
          type="select"
          value={newExpenseCategory}
          onChange={setNewExpenseCategory}
          options={EXPENSE_CATEGORIES}
          className="w-full sm:w-1/3"
        />
        <Button onClick={handleAddExpense}>Add Expense</Button>
      </div>

      {expenses.length > 0 && (
        <ul className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
          {expenses.map((expense) => (
            <li
              key={expense.id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b border-gray-200 last:border-b-0 px-2"
            >
              <span className="text-gray-800 font-medium text-base mb-2 sm:mb-0">
                {expense.name} (
                <span className="text-gray-600">{expense.category}</span>):
                <span className="text-red-600 font-semibold">
                  {" "}
                  {formatCurrency(expense.amount)}
                </span>
              </span>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleRemoveExpense(expense.id)}
                className="text-sm py-1 px-3"
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xl font-bold text-gray-800">
          Total Monthly Expenses:{" "}
          <span className="text-red-600">{formatCurrency(totalExpenses)}</span>
        </p>
      </div>
    </div>
  );
};
