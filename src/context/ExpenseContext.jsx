
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import {
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
} from '../utils/onstants-temp.js';

import { loadData, saveData, clearAllData } from '../utils/storage';

import {
  getTotals,
  filterByMonth,
  getCurrentMonthKey,
  generateId,
  getTodayString,
} from '../utils/calculations';

import {
  createSampleTransactions,
  createSampleBudgets,
  createSampleGoals,
} from '../utils/sampleData';

const ExpenseContext = createContext(null);

export function ExpenseProvider({ children }) {
  const [transactions, setTransactions] = useState(
    () => loadData(STORAGE_KEYS.transactions, []),
  );

  const [budgets, setBudgets] = useState(
    () => loadData(STORAGE_KEYS.budgets, { monthly: 0, categories: {} }),
  );

  const [goals, setGoals] = useState(
    () => loadData(STORAGE_KEYS.goals, []),
  );

  const [settings, setSettings] = useState(
    () => loadData(STORAGE_KEYS.settings, DEFAULT_SETTINGS),
  );
  // Apply theme to the entire website
useEffect(() => {
  document.documentElement.setAttribute(
    'data-theme',
    settings.theme || 'light'
  );
}, [settings.theme]);

  // Save data automatically whenever state changes
  useEffect(() => {
    saveData(STORAGE_KEYS.transactions, transactions);
  }, [transactions]);

  useEffect(() => {
    saveData(STORAGE_KEYS.budgets, budgets);
  }, [budgets]);

  useEffect(() => {
    saveData(STORAGE_KEYS.goals, goals);
  }, [goals]);

  useEffect(() => {
    saveData(STORAGE_KEYS.settings, settings);
  }, [settings]);

  // Transactions
  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: transaction.id || generateId(),
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    return newTransaction;
  };

  const updateTransaction = (id, updates) => {
    setTransactions((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      ),
    );
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
  };

  const getTransactionById = (id) =>
    transactions.find((item) => item.id === id);

  // Budgets
  const updateBudgets = (updates) => {
    setBudgets((prev) => ({
      ...prev,
      ...updates,
      categories: {
        ...prev.categories,
        ...(updates.categories || {}),
      },
    }));
  };

  const setCategoryBudget = (category, amount) => {
    setBudgets((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: Number(amount) || 0,
      },
    }));
  };

  // Savings goals
  const addGoal = (goal) => {
    setGoals((prev) => [
      ...prev,
      {
        ...goal,
        id: goal.id || generateId(),
        savedAmount: Number(goal.savedAmount) || 0,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const updateGoal = (id, updates) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === id ? { ...goal, ...updates } : goal,
      ),
    );
  };

  const deleteGoal = (id) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  };

  const addToGoal = (id, amount) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === id
          ? { ...goal, savedAmount: Number(goal.savedAmount) + Number(amount) }
          : goal,
      ),
    );
  };

  // Settings and theme
  const updateSettings = (updates) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const toggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  // Sample data and reset
  const loadSampleData = () => {
    setTransactions(createSampleTransactions());
    setBudgets(createSampleBudgets());
    setGoals(createSampleGoals());
  };

  const resetAllData = () => {
    clearAllData();
    setTransactions([]);
    setBudgets({ monthly: 0, categories: {} });
    setGoals([]);
    setSettings(DEFAULT_SETTINGS);
  };

  // Derived statistics
  const currentMonthTransactions = useMemo(
    () => filterByMonth(transactions, getCurrentMonthKey()),
    [transactions],
  );

  const totals = useMemo(
    () => getTotals(transactions),
    [transactions],
  );

  const monthlyTotals = useMemo(
    () => getTotals(currentMonthTransactions),
    [currentMonthTransactions],
  );

  const value = {
    transactions,
    budgets,
    goals,
    settings,
    theme: settings.theme,

    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionById,

    updateBudgets,
    setCategoryBudget,

    addGoal,
    updateGoal,
    deleteGoal,
    addToGoal,

    updateSettings,
    toggleTheme,

    loadSampleData,
    resetAllData,

    totals,
    monthlyTotals,
    currentMonthTransactions,
    transactionCount: transactions.length,
    today: getTodayString(),
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpense() {
  const context = useContext(ExpenseContext);

  if (!context) {
    throw new Error('useExpense must be used inside ExpenseProvider');
  }

  return context;
}
