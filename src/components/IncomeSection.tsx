import React, { useState, useMemo } from "react";
import { generateId, validateAmount, formatCurrency } from "../utils/helper.ts";
import { FormInput } from "./ui/FormInput";
import { Button } from "./ui/Button";
import type { IncomeSource } from "../types/budget.types.ts";

interface IncomeSectionProps {
  baseIncome: number;
  setBaseIncome: (income: number) => void;
  additionalIncomes: IncomeSource[];
  setAdditionalIncomes: (incomes: IncomeSource[]) => void;
}

export const IncomeSection: React.FC<IncomeSectionProps> = ({
  baseIncome,
  setBaseIncome,
  additionalIncomes,
  setAdditionalIncomes,
}) => {
  const [newIncomeName, setNewIncomeName] = useState("");
  const [newIncomeAmount, setNewIncomeAmount] = useState("");

  const totalIncome = useMemo(() => {
    const additionalTotal = additionalIncomes.reduce(
      (acc, income) => acc + income.amount,
      0,
    );
    return baseIncome + additionalTotal;
  }, [baseIncome, additionalIncomes]);

  const handleAddIncome = () => {
    const amount = validateAmount(newIncomeAmount);
    if (newIncomeName.trim() && amount) {
      setAdditionalIncomes([
        ...additionalIncomes,
        { id: generateId(), name: newIncomeName.trim(), amount },
      ]);
      setNewIncomeName("");
      setNewIncomeAmount("");
    }
  };

  const handleRemoveIncome = (id: string) => {
    setAdditionalIncomes(
      additionalIncomes.filter((income) => income.id !== id),
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-6 w-full border border-gray-200">
      <h2 className="text-2xl font-bold mb-5 text-gray-800 border-b pb-3 border-gray-100">
        Income Tracking
      </h2>

      <div className="mb-4">
        <label
          htmlFor="baseIncome"
          className="block text-gray-700 text-base font-semibold mb-2"
        >
          Monthly Base Income (Salary):
        </label>
        <FormInput
          type="number"
          value={baseIncome}
          onChange={(value) => setBaseIncome(parseFloat(value) || 0)}
          placeholder="e.g., 3000"
          className="w-full"
        />
      </div>

      <h3 className="text-xl font-semibold mb-4 text-gray-700">
        Additional Income Sources
      </h3>
      <div className="flex flex-col sm:flex-row gap-3 mb-4 items-end">
        <FormInput
          type="text"
          value={newIncomeName}
          onChange={setNewIncomeName}
          placeholder="Income Name (e.g., Freelance)"
          className="flex-grow"
        />
        <FormInput
          type="number"
          value={newIncomeAmount}
          onChange={setNewIncomeAmount}
          placeholder="Amount"
          className="w-full sm:w-1/3"
        />
        <Button onClick={handleAddIncome}>Add Income</Button>
      </div>

      {additionalIncomes.length > 0 && (
        <ul className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
          {additionalIncomes.map((income) => (
            <li
              key={income.id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b border-gray-200 last:border-b-0 px-2"
            >
              <span className="text-gray-800 font-medium text-base mb-2 sm:mb-0">
                {income.name}:{" "}
                <span className="text-green-600 font-semibold">
                  {formatCurrency(income.amount)}
                </span>
              </span>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleRemoveIncome(income.id)}
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
          Total Monthly Income:{" "}
          <span className="text-green-600">{formatCurrency(totalIncome)}</span>
        </p>
      </div>
    </div>
  );
};
