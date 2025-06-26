import React, { useState, useCallback } from "react";
import type { SavingsAccount } from "../types/budget.types";
import { generateId, validateAmount, formatCurrency } from "../utils/helper.ts";
import { FormInput } from "./ui/FormInput";
import { Button } from "./ui/Button";

interface SavingsSectionProps {
  moneyAvailableBeforeSavings: number;
  savingsAccounts: SavingsAccount[];
  setSavingsAccounts: (accounts: SavingsAccount[]) => void;
  monthlyAllocatedToSavings: number;
  setMonthlyAllocatedToSavings: (amount: number) => void;
  totalSavingsAccountBalance: number;
}

export const SavingsSection: React.FC<SavingsSectionProps> = ({
  moneyAvailableBeforeSavings,
  savingsAccounts,
  setSavingsAccounts,
  monthlyAllocatedToSavings,
  setMonthlyAllocatedToSavings,
  totalSavingsAccountBalance,
}) => {
  const [newAccountName, setNewAccountName] = useState("");
  const [allocationAmount, setAllocationAmount] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [updateAccountId, setUpdateAccountId] = useState("");
  const [updateBalanceAmount, setUpdateBalanceAmount] = useState("");

  const handleAccountSelect = (accountName: string) => {
    if (accountName === "Select Account") {
      setSelectedAccountId("");
    } else {
      const account = savingsAccounts.find((acc) => acc.name === accountName);
      setSelectedAccountId(account?.id || "");
    }
  };

  const handleUpdateAccountSelect = (accountName: string) => {
    if (accountName === "Select Account to Update") {
      setUpdateAccountId("");
    } else {
      const account = savingsAccounts.find((acc) => acc.name === accountName);
      setUpdateAccountId(account?.id || "");
    }
  };

  const getSelectedAccountName = () => {
    if (!selectedAccountId) return "Select Account";
    const account = savingsAccounts.find((acc) => acc.id === selectedAccountId);
    return account?.name || "Select Account";
  };

  const getUpdateAccountName = () => {
    if (!updateAccountId) return "Select Account to Update";
    const account = savingsAccounts.find((acc) => acc.id === updateAccountId);
    return account?.name || "Select Account to Update";
  };

  const handleCreateAccount = () => {
    if (newAccountName.trim()) {
      setSavingsAccounts([
        ...savingsAccounts,
        {
          id: generateId(),
          name: newAccountName.trim(),
          balance: 0,
          target: 0,
        },
      ]);
      setNewAccountName("");
    }
  };

  const handleAllocateMoney = () => {
    const amount = validateAmount(allocationAmount);
    if (selectedAccountId && amount && amount <= currentAvailableToAllocate) {
      setSavingsAccounts(
        savingsAccounts.map((account) =>
          account.id === selectedAccountId
            ? { ...account, balance: account.balance + amount }
            : account,
        ),
      );
      setMonthlyAllocatedToSavings(monthlyAllocatedToSavings + amount);
      setAllocationAmount("");
      setSelectedAccountId("");
    } else if (amount && amount > currentAvailableToAllocate) {
      alert("Allocation amount exceeds available money for this month.");
    } else {
      alert("Please select an account and enter a valid amount to allocate.");
    }
  };

  const handleUpdateAccountBalance = () => {
    const amount = parseFloat(updateBalanceAmount);
    if (updateAccountId && !isNaN(amount) && amount >= 0) {
      setSavingsAccounts(
        savingsAccounts.map((account) =>
          account.id === updateAccountId
            ? { ...account, balance: amount }
            : account,
        ),
      );
      setUpdateBalanceAmount("");
      setUpdateAccountId("");
    } else if (isNaN(amount) || amount < 0) {
      alert("Please enter a valid positive number for the balance.");
    } else {
      alert("Please select an account and enter a valid balance.");
    }
  };

  const getProgressPercentage = useCallback(
    (balance: number): number => {
      const effectiveMax = Math.max(
        1000,
        totalSavingsAccountBalance * 1.5,
        balance * 2,
      );
      return (balance / effectiveMax) * 100;
    },
    [totalSavingsAccountBalance],
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full border border-gray-200">
      <h2 className="text-2xl font-bold mb-5 text-gray-800 border-b pb-3 border-gray-100">
        Savings & Investment Allocation
      </h2>

      <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-lg font-bold text-blue-800">
          Money Available to Allocate This Month:
          <span className="text-blue-700">
            {" "}
            {formatCurrency(Math.max(0, currentAvailableToAllocate))}
          </span>
        </p>
      </div>

      <h3 className="text-xl font-semibold mb-4 text-gray-700">
        Create New Savings Account
      </h3>
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-end">
        <FormInput
          type="text"
          value={newAccountName}
          onChange={setNewAccountName}
          placeholder="Account Name (e.g., Emergency Fund)"
          className="flex-grow"
        />
        <Button onClick={handleCreateAccount}>Create Account</Button>
      </div>

      {savingsAccounts.length > 0 && (
        <>
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Allocate Money from Monthly Income
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 mb-6 items-end">
            <FormInput
              type="select"
              value={getSelectedAccountName()}
              onChange={handleAccountSelect}
              options={accountOptions}
              className="flex-grow"
            />
            <FormInput
              type="number"
              value={allocationAmount}
              onChange={setAllocationAmount}
              placeholder="Amount to Allocate"
              className="w-full sm:w-1/3"
              min="0"
              max={currentAvailableToAllocate.toFixed(2)}
            />
            <Button
              variant="success"
              onClick={handleAllocateMoney}
              disabled={
                !selectedAccountId ||
                !validateAmount(allocationAmount) ||
                (validateAmount(allocationAmount) || 0) >
                  currentAvailableToAllocate
              }
            >
              Allocate
            </Button>
          </div>

          <h3 className="text-xl font-semibold mb-4 text-gray-700 mt-6 pt-4 border-t border-gray-100">
            Manually Adjust Account Balances
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 mb-6 items-end">
            <FormInput
              type="select"
              value={getUpdateAccountName()}
              onChange={handleUpdateAccountSelect}
              options={updateAccountOptions}
              className="flex-grow"
            />
            <FormInput
              type="number"
              value={updateBalanceAmount}
              onChange={setUpdateBalanceAmount}
              placeholder="New Balance"
              className="w-full sm:w-1/3"
              min="0"
            />
            <Button
              variant="warning"
              onClick={handleUpdateAccountBalance}
              disabled={
                !updateAccountId ||
                isNaN(parseFloat(updateBalanceAmount)) ||
                parseFloat(updateBalanceAmount) < 0
              }
            >
              Update Balance
            </Button>
          </div>

          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Account Balances & Progress
          </h3>
          <ul className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            {savingsAccounts.map((account) => {
              const progress = getProgressPercentage(account.balance);
              return (
                <li
                  key={account.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b border-gray-200 last:border-b-0 px-2"
                >
                  <div className="flex-grow mb-2 sm:mb-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-800 font-medium text-base">
                        {account.name}:
                      </span>
                      <span className="text-blue-700 font-bold">
                        {formatCurrency(account.balance)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};
