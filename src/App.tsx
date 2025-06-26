import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from 'firebase/app'; // Import FirebaseOptions for type safety
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, Firestore } from 'firebase/firestore';

// --- Type Definitions ---

interface IncomeSource {
    id: string;
    name: string;
    amount: number;
}

interface Expense {
    id: string;
    name: string;
    amount: number;
    category: string;
}

interface SavingsAccount {
    id: string;
    name: string;
    balance: number;
    target: number; // Placeholder for future target functionality
}

interface BudgetData {
    baseIncome: number;
    additionalIncomes: IncomeSource[];
    expenses: Expense[];
    savingsAccounts: SavingsAccount[];
    monthlyAllocatedToSavings: number;
}

interface OverallSummaryCardsProps {
    totalIncome: number;
    totalExpenses: number;
    remainingBalance: number;
}

interface IncomeInputProps {
    baseIncome: number;
    setBaseIncome: React.Dispatch<React.SetStateAction<number>>;
    additionalIncomes: IncomeSource[];
    setAdditionalIncomes: React.Dispatch<React.SetStateAction<IncomeSource[]>>;
}

interface ExpenseInputProps {
    expenses: Expense[];
    setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}

interface SavingsAllocationProps {
    moneyAvailableBeforeSavings: number;
    savingsAccounts: SavingsAccount[];
    setSavingsAccounts: React.Dispatch<React.SetStateAction<SavingsAccount[]>>;
    monthlyAllocatedToSavings: number;
    setMonthlyAllocatedToSavings: React.Dispatch<React.SetStateAction<number>>;
    totalSavingsAccountBalance: number;
}

// --- Common Expense Categories ---
const expenseCategories: string[] = [
    'Housing', 'Food', 'Transportation', 'Utilities', 'Entertainment',
    'Insurance', 'Healthcare', 'Education', 'Personal Care', 'Debt Payments',
    'Savings', 'Miscellaneous'
];

// Helper to generate unique IDs
const generateId = (): string => Math.random().toString(36).substring(2, 9);

// --- OverallSummaryCards Component ---
const OverallSummaryCards: React.FC<OverallSummaryCardsProps> = ({ totalIncome, totalExpenses, remainingBalance }) => {
    const isSaving = remainingBalance >= 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {/* Total Income Card */}
            <div className="bg-gradient-to-br from-purple-700 to-purple-500 text-white p-6 rounded-xl shadow-xl flex flex-col items-center justify-center transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl text-center">
                <p className="text-lg font-semibold opacity-90 mb-1">Total Income</p>
                <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">${totalIncome.toFixed(2)}</p>
            </div>

            {/* Total Expenses Card */}
            <div className="bg-gradient-to-br from-red-700 to-red-500 text-white p-6 rounded-xl shadow-xl flex flex-col items-center justify-center transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl text-center">
                <p className="text-lg font-semibold opacity-90 mb-1">Total Expenses</p>
                <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">${totalExpenses.toFixed(2)}</p>
            </div>

            {/* Remaining Balance Card */}
            <div className={`bg-gradient-to-br ${isSaving ? 'from-green-700 to-green-500' : 'from-rose-700 to-red-600'} text-white p-6 rounded-xl shadow-xl flex flex-col items-center justify-center transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl text-center`}>
                <p className="text-lg font-semibold opacity-90 mb-1">Remaining Balance</p>
                <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">${remainingBalance.toFixed(2)}</p>
                <p className="text-sm mt-2 opacity-80 font-medium">
                    {isSaving ? 'You are saving money!' : 'You are losing money!'}
                </p>
            </div>
        </div>
    );
};

// --- IncomeInput Component ---
const IncomeInput: React.FC<IncomeInputProps> = ({ baseIncome, setBaseIncome, additionalIncomes, setAdditionalIncomes }) => {
    const [newIncomeName, setNewIncomeName] = useState<string>('');
    const [newIncomeAmount, setNewIncomeAmount] = useState<string>('');

    const handleAddAdditionalIncome = (): void => {
        const amount = parseFloat(newIncomeAmount);
        if (newIncomeName.trim() && !isNaN(amount) && amount > 0) {
            setAdditionalIncomes(prev => [
                ...prev,
                { id: generateId(), name: newIncomeName.trim(), amount: amount }
            ]);
            setNewIncomeName('');
            setNewIncomeAmount('');
        }
    };

    const handleRemoveAdditionalIncome = (id: string): void => {
        setAdditionalIncomes(prev => prev.filter(income => income.id !== id));
    };

    const totalIncome = useMemo<number>(() => {
        const totalAddIncome = additionalIncomes.reduce((acc, income) => acc + income.amount, 0);
        return baseIncome + totalAddIncome;
    }, [baseIncome, additionalIncomes]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6 w-full border border-gray-200">
            <h2 className="text-2xl font-bold mb-5 text-gray-800 border-b pb-3 border-gray-100">Income Tracking</h2>
            <div className="mb-4">
                <label htmlFor="baseIncome" className="block text-gray-700 text-base font-semibold mb-2">
                    Monthly Base Income (Salary):
                </label>
                <input
                    type="number"
                    id="baseIncome"
                    value={baseIncome}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBaseIncome(parseFloat(e.target.value) || 0)}
                    className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    placeholder="e.g., 3000"
                />
            </div>

            <h3 className="text-xl font-semibold mb-4 text-gray-700">Additional Income Sources</h3>
            <div className="flex flex-col sm:flex-row gap-3 mb-4 items-end">
                <input
                    type="text"
                    placeholder="Income Name (e.g., Freelance)"
                    value={newIncomeName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewIncomeName(e.target.value)}
                    className="shadow-sm appearance-none border border-gray-300 rounded-lg py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-grow transition duration-200"
                />
                <input
                    type="number"
                    placeholder="Amount"
                    value={newIncomeAmount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewIncomeAmount(e.target.value)}
                    className="shadow-sm appearance-none border border-gray-300 rounded-lg py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-1/3 transition duration-200"
                />
                <button
                    onClick={handleAddAdditionalIncome}
                    className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out transform hover:-translate-y-0.5 shadow-md hover:shadow-lg w-full sm:w-auto"
                >
                    Add Income
                </button>
            </div>

            {additionalIncomes.length > 0 && (
                <ul className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    {additionalIncomes.map((income) => (
                        <li key={income.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b border-gray-200 last:border-b-0 px-2">
                            <span className="text-gray-800 font-medium text-base mb-2 sm:mb-0">{income.name}: <span className="text-green-600 font-semibold">${income.amount.toFixed(2)}</span></span>
                            <button
                                onClick={() => handleRemoveAdditionalIncome(income.id)}
                                className="text-red-500 hover:text-red-700 font-bold px-3 py-1 rounded-md transition duration-200 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 self-end sm:self-auto"
                            >
                                &times; Remove
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xl font-bold text-gray-800">Total Monthly Income: <span className="text-green-600">${totalIncome.toFixed(2)}</span></p>
            </div>
        </div>
    );
};

// --- ExpenseInput Component ---
const ExpenseInput: React.FC<ExpenseInputProps> = ({ expenses, setExpenses }) => {
    const [newExpenseName, setNewExpenseName] = useState<string>('');
    const [newExpenseAmount, setNewExpenseAmount] = useState<string>('');
    const [newExpenseCategory, setNewExpenseCategory] = useState<string>(expenseCategories[0]);

    const handleAddExpense = (): void => {
        const amount = parseFloat(newExpenseAmount);
        if (newExpenseName.trim() && !isNaN(amount) && amount > 0) {
            setExpenses(prev => [
                ...prev,
                {
                    id: generateId(),
                    name: newExpenseName.trim(),
                    amount: amount,
                    category: newExpenseCategory
                }
            ]);
            setNewExpenseName('');
            setNewExpenseAmount('');
        }
    };

    const handleRemoveExpense = (id: string): void => {
        setExpenses(prev => prev.filter(expense => expense.id !== id));
    };

    const totalExpenses = useMemo<number>(() => {
        return expenses.reduce((acc, expense) => acc + expense.amount, 0);
    }, [expenses]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6 w-full border border-gray-200">
            <h2 className="text-2xl font-bold mb-5 text-gray-800 border-b pb-3 border-gray-100">Expense Management</h2>

            <h3 className="text-xl font-semibold mb-4 text-gray-700">Monthly Recurring Expenses</h3>
            <div className="flex flex-col sm:flex-row gap-3 mb-4 items-end">
                <input
                    type="text"
                    placeholder="Expense Name (e.g., Rent)"
                    value={newExpenseName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewExpenseName(e.target.value)}
                    className="shadow-sm appearance-none border border-gray-300 rounded-lg py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-grow transition duration-200"
                />
                <input
                    type="number"
                    placeholder="Amount"
                    value={newExpenseAmount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewExpenseAmount(e.target.value)}
                    className="shadow-sm appearance-none border border-gray-300 rounded-lg py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-1/3 transition duration-200"
                />
                <select
                    value={newExpenseCategory}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewExpenseCategory(e.target.value)}
                    className="shadow-sm appearance-none border border-gray-300 rounded-lg py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-1/3 transition duration-200"
                >
                    {expenseCategories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleAddExpense}
                    className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out transform hover:-translate-y-0.5 shadow-md hover:shadow-lg w-full sm:w-auto"
                >
                    Add Expense
                </button>
            </div>

            {expenses.length > 0 && (
                <ul className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    {expenses.map((expense) => (
                        <li key={expense.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b border-gray-200 last:border-b-0 px-2">
                            <span className="text-gray-800 font-medium text-base mb-2 sm:mb-0">{expense.name} (<span className="text-gray-600">{expense.category}</span>): <span className="text-red-600 font-semibold">${expense.amount.toFixed(2)}</span></span>
                            <button
                                onClick={() => handleRemoveExpense(expense.id)}
                                className="text-red-500 hover:text-red-700 font-bold px-3 py-1 rounded-md transition duration-200 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 self-end sm:self-auto"
                            >
                                &times; Remove
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xl font-bold text-gray-800">Total Monthly Expenses: <span className="text-red-600">${totalExpenses.toFixed(2)}</span></p>
            </div>
        </div>
    );
};

// --- SavingsAllocation Component ---
const SavingsAllocation: React.FC<SavingsAllocationProps> = ({ moneyAvailableBeforeSavings, savingsAccounts, setSavingsAccounts, monthlyAllocatedToSavings, setMonthlyAllocatedToSavings, totalSavingsAccountBalance }) => {
    const [newAccountName, setNewAccountName] = useState<string>('');
    const [allocationAmount, setAllocationAmount] = useState<string>('');
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');

    const [updateAccountId, setUpdateAccountId] = useState<string>('');
    const [updateBalanceAmount, setUpdateBalanceAmount] = useState<string>('');

    const currentAvailableToAllocate = moneyAvailableBeforeSavings - monthlyAllocatedToSavings;

    const handleCreateAccount = (): void => {
        if (newAccountName.trim()) {
            setSavingsAccounts(prev => [
                ...prev,
                { id: generateId(), name: newAccountName.trim(), balance: 0, target: 0 }
            ]);
            setNewAccountName('');
        }
    };

    const handleAllocateMoney = (): void => {
        const amount = parseFloat(allocationAmount);
        if (selectedAccountId && !isNaN(amount) && amount > 0 && amount <= currentAvailableToAllocate) {
            setSavingsAccounts(prevAccounts =>
                prevAccounts.map(account =>
                    account.id === selectedAccountId
                        ? { ...account, balance: account.balance + amount }
                        : account
                )
            );
            setMonthlyAllocatedToSavings(prevTotal => prevTotal + amount);
            setAllocationAmount('');
        } else if (amount > currentAvailableToAllocate) {
            alert("Allocation amount exceeds available money for this month.");
        } else {
            alert("Please select an account and enter a valid amount to allocate.");
        }
    };

    const handleUpdateAccountBalance = (): void => {
        const amount = parseFloat(updateBalanceAmount);
        if (updateAccountId && !isNaN(amount) && amount >= 0) {
            setSavingsAccounts(prevAccounts => {
                return prevAccounts.map(account =>
                    account.id === updateAccountId
                        ? { ...account, balance: amount }
                        : account
                );
            });
            setUpdateBalanceAmount('');
            setUpdateAccountId('');
        } else if (isNaN(amount) || amount < 0) {
            alert("Please enter a valid positive number for the balance.");
        } else {
            alert("Please select an account and enter a valid balance.");
        }
    };

    const getProgressPercentage = useCallback((balance: number): number => {
        const effectiveMax = Math.max(1000, totalSavingsAccountBalance * 1.5, balance * 2);
        return (balance / effectiveMax) * 100;
    }, [totalSavingsAccountBalance]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg w-full border border-gray-200">
            <h2 className="text-2xl font-bold mb-5 text-gray-800 border-b pb-3 border-gray-100">Savings & Investment Allocation</h2>

            <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-lg font-bold text-blue-800">Money Available to Allocate This Month: <span className="text-blue-700">${Math.max(0, currentAvailableToAllocate).toFixed(2)}</span></p>
            </div>

            <h3 className="text-xl font-semibold mb-4 text-gray-700">Create New Savings Account</h3>
            <div className="flex flex-col sm:flex-row gap-3 mb-6 items-end">
                <input
                    type="text"
                    placeholder="Account Name (e.g., Emergency Fund)"
                    value={newAccountName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAccountName(e.target.value)}
                    className="shadow-sm appearance-none border border-gray-300 rounded-lg py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-grow transition duration-200"
                />
                <button
                    onClick={handleCreateAccount}
                    className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out transform hover:-translate-y-0.5 shadow-md hover:shadow-lg w-full sm:w-auto"
                >
                    Create Account
                </button>
            </div>

            {savingsAccounts.length > 0 && (
                <>
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">Allocate Money from Monthly Income</h3>
                    <div className="flex flex-col sm:flex-row gap-3 mb-6 items-end">
                        <select
                            value={selectedAccountId}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedAccountId(e.target.value)}
                            className="shadow-sm appearance-none border border-gray-300 rounded-lg py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-grow transition duration-200"
                        >
                            <option value="">Select Account</option>
                            {savingsAccounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            placeholder="Amount to Allocate"
                            value={allocationAmount}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAllocationAmount(e.target.value)}
                            className="shadow-sm appearance-none border border-gray-300 rounded-lg py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-1/3 transition duration-200"
                            min="0"
                            max={currentAvailableToAllocate.toFixed(2)}
                        />
                        <button
                            onClick={handleAllocateMoney}
                            disabled={!selectedAccountId || parseFloat(allocationAmount) <= 0 || parseFloat(allocationAmount) > currentAvailableToAllocate}
                            className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 ease-in-out transform hover:-translate-y-0.5 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                        >
                            Allocate
                        </button>
                    </div>

                    {/* New section for updating existing account balance */}
                    <h3 className="text-xl font-semibold mb-4 text-gray-700 mt-6 pt-4 border-t border-gray-100">Manually Adjust Account Balances</h3>
                    <div className="flex flex-col sm:flex-row gap-3 mb-6 items-end">
                        <select
                            value={updateAccountId}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setUpdateAccountId(e.target.value)}
                            className="shadow-sm appearance-none border border-gray-300 rounded-lg py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-grow transition duration-200"
                        >
                            <option value="">Select Account to Update</option>
                            {savingsAccounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            placeholder="New Balance"
                            value={updateBalanceAmount}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUpdateBalanceAmount(e.target.value)}
                            className="shadow-sm appearance-none border border-gray-300 rounded-lg py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-1/3 transition duration-200"
                            min="0"
                        />
                        <button
                            onClick={handleUpdateAccountBalance}
                            disabled={!updateAccountId || isNaN(parseFloat(updateBalanceAmount)) || parseFloat(updateBalanceAmount) < 0}
                            className="bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition duration-200 ease-in-out transform hover:-translate-y-0.5 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                        >
                            Update Balance
                        </button>
                    </div>

                    <h3 className="text-xl font-semibold mb-4 text-gray-700">Account Balances & Progress</h3>
                    <ul className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        {savingsAccounts.map((account) => {
                            const progress = getProgressPercentage(account.balance);
                            return (
                                <li key={account.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b border-gray-200 last:border-b-0 px-2">
                                    <div className="flex-grow mb-2 sm:mb-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-gray-800 font-medium text-base">{account.name}:</span>
                                            <span className="text-blue-700 font-bold">${account.balance.toFixed(2)}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                                                style={{ width: `${Math.min(100, progress)}%` }}
                                            ></div>
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

// --- Main App Component ---
function App() {
    // State for income
    const [baseIncome, setBaseIncome] = useState<number>(0);
    const [additionalIncomes, setAdditionalIncomes] = useState<IncomeSource[]>([]);

    // State for expenses
    const [expenses, setExpenses] = useState<Expense[]>([]);

    // State for savings accounts
    const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);
    const [monthlyAllocatedToSavings, setMonthlyAllocatedToSavings] = useState<number>(0);

    // Firebase state
    const [db, setDb] = useState<Firestore | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize Firebase and handle authentication
    useEffect(() => {
        try {
            // --- IMPORTANT: REPLACE WITH YOUR ACTUAL FIREBASE CONFIG ---
            // Get your Firebase config from your Firebase project settings
            // (Project overview -> Project settings (gear icon) -> Your apps -> Web app setup)
            const firebaseConfig: FirebaseOptions = {
                apiKey: "YOUR_API_KEY", // Replace with your apiKey
                authDomain: "YOUR_AUTH_DOMAIN", // Replace with your authDomain
                projectId: "YOUR_PROJECT_ID", // Replace with your projectId
                storageBucket: "YOUR_STORAGE_BUCKET", // Replace with your storageBucket
                messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace with your messagingSenderId
                appId: "YOUR_APP_ID" // Replace with your appId
            };
            // For local development and Vercel, use your projectId as appId for consistent Firestore paths
            const appId: string = firebaseConfig.projectId; // Derived from your config


            if (!firebaseConfig || Object.keys(firebaseConfig).length === 0 || !firebaseConfig.projectId) {
                setError("Firebase configuration is missing or invalid. Data persistence will not work. Please update firebaseConfig object.");
                setLoading(false);
                return;
            }

            const app = initializeApp(firebaseConfig);
            const firestore = getFirestore(app);
            const auth = getAuth(app);

            setDb(firestore);

            const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
                if (user) {
                    setUserId(user.uid);
                    setIsAuthReady(true);
                } else {
                    // In a local/Vercel deployment, __initial_auth_token is not present.
                    // We will always sign in anonymously if no user is found.
                    try {
                        await signInAnonymously(auth);
                    } catch (authError: any) {
                        setError(`Authentication failed: ${authError.message || 'Unknown error'}. Data persistence might be affected.`);
                        setLoading(false);
                    }
                }
            });

            return () => unsubscribe();
        } catch (err: any) {
            setError(`Failed to initialize Firebase: ${err.message || 'Unknown error'}. Data persistence will not work.`);
            setLoading(false);
        }
    }, []);

    // Load data from Firestore
    useEffect(() => {
        const loadBudgetData = async () => {
            if (db && userId && isAuthReady) {
                setLoading(true);
                setError(null);
                try {
                    // --- IMPORTANT: Use firebaseConfig.projectId as appId if you replaced the Canvas global ---
                    // Ensure this matches the `appId` used during Firebase initialization above.
                    const currentAppId: string = (firebase as any)?.app().options.projectId || 'default-app-id'; // Fallback if firebase object not fully typed

                    const docRef = doc(db, `artifacts/${currentAppId}/users/${userId}/budgetData/user_budget_data`);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data() as BudgetData;
                        setBaseIncome(data.baseIncome || 0);
                        setAdditionalIncomes(data.additionalIncomes || []);
                        setExpenses(data.expenses || []);
                        setSavingsAccounts(data.savingsAccounts || []);
                        setMonthlyAllocatedToSavings(data.monthlyAllocatedToSavings || 0);
                    } else {
                        setMonthlyAllocatedToSavings(0);
                    }
                } catch (loadError: any) {
                    setError(`Failed to load your budget data: ${loadError.message || 'Unknown error'}.`);
                } finally {
                    setLoading(false);
                }
            }
        };

        if (isAuthReady) {
            loadBudgetData();
        }
    }, [db, userId, isAuthReady]);

    // Save data to Firestore with debouncing
    useEffect(() => {
        let timeoutId: number; // Corrected type for setTimeout return in browser environments
        const saveBudgetData = async () => {
            if (db && userId && isAuthReady && !loading) {
                setError(null);
                try {
                    // --- IMPORTANT: Use firebaseConfig.projectId as appId if you replaced the Canvas global ---
                    // Ensure this matches the `appId` used during Firebase initialization above.
                    const currentAppId: string = (firebase as any)?.app().options.projectId || 'default-app-id'; // Fallback if firebase object not fully typed

                    const docRef = doc(db, `artifacts/${currentAppId}/users/${userId}/budgetData/user_budget_data`);
                    const payload: BudgetData = {
                        baseIncome,
                        additionalIncomes,
                        expenses,
                        savingsAccounts,
                        monthlyAllocatedToSavings,
                    };
                    await setDoc(docRef, payload, { merge: false });
                } catch (saveError: any) {
                    setError(`Failed to save your budget data automatically: ${saveError.message || 'Unknown error'}.`);
                }
            }
        };

        if (isAuthReady) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(saveBudgetData, 1000);
        }

        return () => clearTimeout(timeoutId);
    }, [baseIncome, additionalIncomes, expenses, savingsAccounts, monthlyAllocatedToSavings, db, userId, isAuthReady, loading]);

    // Calculate total income and expenses
    const totalIncome = useMemo<number>(() => {
        const addIncomeSum = additionalIncomes.reduce((acc, income) => acc + income.amount, 0);
        return baseIncome + totalAddIncome;
    }, [baseIncome, additionalIncomes]);

    const totalExpenses = useMemo<number>(() => {
        return expenses.reduce((acc, expense) => acc + expense.amount, 0);
    }, [expenses]);

    // Calculate the total balance across ALL savings accounts (for progress bars and overall view)
    const totalSavingsAccountBalance = useMemo<number>(() => {
        return savingsAccounts.reduce((acc, account) => acc + account.balance, 0);
    }, [savingsAccounts]);

    // Calculate money available before any savings allocations for the current month
    const moneyAvailableBeforeSavings = totalIncome - totalExpenses;

    // Calculate the final remaining balance *after* all expenses AND monthly savings allocations
    const finalNetBalance = moneyAvailableBeforeSavings - monthlyAllocatedToSavings;

    return (
        // Tailwind CSS setup for the entire app
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 font-inter antialiased">
            {/* Tailwind CSS CDN and Font Link - typically moved to index.html/public for a real React app */}
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

            <style>{`
        body {
          font-family: 'Inter', sans-serif;
        }
      `}</style>

            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-gray-900 mb-10 leading-tight tracking-tight">
                    Personal Budget <span className="text-blue-600">Tracker</span>
                </h1>

                {loading && (
                    <div className="text-center py-4 text-gray-700 font-semibold">
                        Loading your budget data...
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline ml-2">{error}</span>
                    </div>
                )}

                {/* Display UserId for debugging/multi-user context */}
                {userId && (
                    <div className="text-center text-sm text-gray-600 mb-4">
                        Your User ID: <span className="font-mono bg-gray-200 px-2 py-1 rounded-md">{userId}</span>
                    </div>
                )}

                {/* Render components only when Firebase and data are ready */}
                {!loading && (
                    <>
                        <OverallSummaryCards
                            totalIncome={totalIncome}
                            totalExpenses={totalExpenses}
                            remainingBalance={finalNetBalance}
                        />

                        <IncomeInput
                            baseIncome={baseIncome}
                            setBaseIncome={setBaseIncome}
                            additionalIncomes={additionalIncomes}
                            setAdditionalIncomes={setAdditionalIncomes}
                        />

                        <ExpenseInput
                            expenses={expenses}
                            setExpenses={setExpenses}
                        />

                        <SavingsAllocation
                            moneyAvailableBeforeSavings={moneyAvailableBeforeSavings}
                            savingsAccounts={savingsAccounts}
                            setSavingsAccounts={setSavingsAccounts}
                            monthlyAllocatedToSavings={monthlyAllocatedToSavings}
                            setMonthlyAllocatedToSavings={setMonthlyAllocatedToSavings}
                            totalSavingsAccountBalance={totalSavingsAccountBalance}
                        />
                    </>
                )}
            </div>
        </div>
    );
}

export default App;
