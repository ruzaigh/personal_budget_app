import React from "react";
import { formatCurrency } from "../utils/helper.ts";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  remainingBalance: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalIncome,
  totalExpenses,
  remainingBalance,
}) => {
  const isSaving = remainingBalance >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <div className="bg-gradient-to-br from-purple-700 to-purple-500 text-white p-6 rounded-xl shadow-xl flex flex-col items-center justify-center transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl text-center">
        <p className="text-lg font-semibold opacity-90 mb-1">Total Income</p>
        <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          {formatCurrency(totalIncome)}
        </p>
      </div>

      <div className="bg-gradient-to-br from-red-700 to-red-500 text-white p-6 rounded-xl shadow-xl flex flex-col items-center justify-center transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl text-center">
        <p className="text-lg font-semibold opacity-90 mb-1">Total Expenses</p>
        <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          {formatCurrency(totalExpenses)}
        </p>
      </div>

      <div
        className={`bg-gradient-to-br ${isSaving ? "from-green-700 to-green-500" : "from-rose-700 to-red-600"} text-white p-6 rounded-xl shadow-xl flex flex-col items-center justify-center transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl text-center`}
      >
        <p className="text-lg font-semibold opacity-90 mb-1">
          Remaining Balance
        </p>
        <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          {formatCurrency(remainingBalance)}
        </p>
        <p className="text-sm mt-2 opacity-80 font-medium">
          {isSaving ? "You are saving money!" : "You are losing money!"}
        </p>
      </div>
    </div>
  );
};
