
import {
  CURRENCIES,
  EXPENSE_CATEGORIES,
  INCOME_SOURCES,
  BUDGET_WARNING_THRESHOLD,
} from './onstants-temp.js';

const pad = (n) => String(n).padStart(2, '0');

export function generateId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const getMonthKey = (dateStr) => dateStr.slice(0, 7);
export const getCurrentMonthKey = () => getTodayString().slice(0, 7);

export function shiftMonth(monthKey, delta) {
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function getDaysInMonth(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

export function getElapsedDays(monthKey) {
  const current = getCurrentMonthKey();
  if (monthKey === current) return new Date().getDate();
  if (monthKey > current) return 0;
  return getDaysInMonth(monthKey);
}

export function getMonthLabel(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function getMonthShort(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short' });
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return parseDate(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getMonthOptions(transactions) {
  const keys = new Set();
  const current = getCurrentMonthKey();

  for (let i = 0; i < 12; i++) keys.add(shiftMonth(current, -i));
  transactions.forEach((t) => keys.add(getMonthKey(t.date)));

  return [...keys].sort().reverse().map((key) => ({
    key,
    label: getMonthLabel(key),
  }));
}

function getCurrency(code) {
  return CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
}

export function formatCurrency(amount, currencyCode = 'INR') {
  const c = getCurrency(currencyCode);
  return new Intl.NumberFormat(c.locale, {
    style: 'currency',
    currency: c.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

export function formatCompact(amount, currencyCode = 'INR') {
  const c = getCurrency(currencyCode);
  return new Intl.NumberFormat(c.locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(amount) || 0);
}

export const filterByMonth = (transactions, monthKey) =>
  transactions.filter((t) => getMonthKey(t.date) === monthKey);

export function sumAmount(transactions, type) {
  return transactions
    .filter((t) => t.type === type)
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

export function getTotals(transactions) {
  const income = sumAmount(transactions, 'income');
  const expense = sumAmount(transactions, 'expense');
  return { income, expense, net: income - expense };
}

export function getCategoryMeta(type, id) {
  const list = type === 'income' ? INCOME_SOURCES : EXPENSE_CATEGORIES;
  return list.find((c) => c.id === id) || {
    id,
    label: id,
    color: '#64748b',
  };
}

export function getCategoryBreakdown(transactions, type = 'expense') {
  const totals = {};

  transactions
    .filter((t) => t.type === type)
    .forEach((t) => {
      totals[t.category] = (totals[t.category] || 0) + Number(t.amount);
    });

  const grand = Object.values(totals).reduce((a, b) => a + b, 0);

  return Object.entries(totals)
    .filter(([, value]) => value > 0)
    .map(([id, value]) => ({
      ...getCategoryMeta(type, id),
      value,
      percent: grand > 0 ? (value / grand) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

export function getHighestCategory(transactions) {
  return getCategoryBreakdown(transactions, 'expense')[0] || null;
}

export function getDailySpending(transactions, monthKey) {
  const days = getElapsedDays(monthKey);
  const data = Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    label: String(i + 1),
    amount: 0,
  }));

  filterByMonth(transactions, monthKey)
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const day = Number(t.date.slice(8, 10));
      if (data[day - 1]) data[day - 1].amount += Number(t.amount);
    });

  return data;
}

export function getMonthlyTrend(transactions, endKey, count = 6) {
  const result = [];

  for (let i = count - 1; i >= 0; i--) {
    const key = shiftMonth(endKey, -i);
    const totals = getTotals(filterByMonth(transactions, key));

    result.push({
      key,
      month: getMonthShort(key),
      income: totals.income,
      expense: totals.expense,
      savings: totals.net,
    });
  }

  return result;
}

export function getAverageDailyExpense(transactions, monthKey) {
  const days = getElapsedDays(monthKey);
  if (days === 0) return 0;

  return sumAmount(filterByMonth(transactions, monthKey), 'expense') / days;
}

export function getBudgetStatus(spent, limit) {
  const limitNum = Number(limit) || 0;

  if (limitNum <= 0) {
    return { limit: 0, spent, remaining: 0, percent: 0, barPercent: 0, status: 'none' };
  }

  const ratio = spent / limitNum;
  let status = 'safe';

  if (ratio > 1) status = 'exceeded';
  else if (ratio >= BUDGET_WARNING_THRESHOLD) status = 'warning';

  return {
    limit: limitNum,
    spent,
    remaining: limitNum - spent,
    percent: ratio * 100,
    barPercent: Math.min(ratio * 100, 100),
    status,
  };
}

export function getCategoryBudgetStatuses(monthTransactions, budgets) {
  return EXPENSE_CATEGORIES.map((cat) => {
    const spent = monthTransactions
      .filter((t) => t.type === 'expense' && t.category === cat.id)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      ...cat,
      ...getBudgetStatus(spent, budgets.categories?.[cat.id]),
    };
  });
}

export function getBudgetAlerts(monthTransactions, budgets, fmt) {
  const alerts = [];
  const spent = sumAmount(monthTransactions, 'expense');
  const overall = getBudgetStatus(spent, budgets.monthly);

  if (overall.status === 'exceeded') {
    alerts.push({
      id: 'monthly',
      type: 'danger',
      title: 'Monthly budget exceeded',
      message: `You have spent ${fmt(spent)} against a budget of ${fmt(overall.limit)}.`,
    });
  } else if (overall.status === 'warning') {
    alerts.push({
      id: 'monthly',
      type: 'warning',
      title: 'Nearing monthly budget',
      message: `${Math.round(overall.percent)}% of your ${fmt(overall.limit)} budget is used.`,
    });
  }

  getCategoryBudgetStatuses(monthTransactions, budgets).forEach((cat) => {
    if (cat.status === 'exceeded') {
      alerts.push({
        id: `cat-${cat.id}`,
        type: 'danger',
        title: `${cat.label} budget exceeded`,
        message: `${fmt(cat.spent)} spent of ${fmt(cat.limit)}.`,
      });
    } else if (cat.status === 'warning') {
      alerts.push({
        id: `cat-${cat.id}`,
        type: 'warning',
        title: `${cat.label} at ${Math.round(cat.percent)}%`,
        message: `${fmt(cat.remaining)} left in this category.`,
      });
    }
  });

  return alerts;
}

export function getGoalProgress(goal) {
  const target = Number(goal.targetAmount) || 0;
  const saved = Number(goal.savedAmount) || 0;
  let daysLeft = null;

  if (goal.targetDate) {
    const diff = parseDate(goal.targetDate) - parseDate(getTodayString());
    daysLeft = Math.round(diff / 86400000);
  }

  return {
    percent: target > 0 ? Math.min((saved / target) * 100, 100) : 0,
    remaining: Math.max(target - saved, 0),
    completed: target > 0 && saved >= target,
    daysLeft,
  };
}

function escapeCSV(value) {
  let s = String(value ?? '');
  if (typeof value === 'string' && /^[=+\-@]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function transactionsToCSV(transactions) {
  const header = ['Date', 'Type', 'Category', 'Description', 'Payment Method', 'Amount'];

  const rows = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((t) => [
      t.date,
      t.type,
      getCategoryMeta(t.type, t.category).label,
      t.description || '',
      t.paymentMethod || '',
      Number(t.amount),
    ]);

  return [header, ...rows].map((row) => row.map(escapeCSV).join(',')).join('\r\n');
}

export function downloadCSV(filename, csvString) {
  const blob = new Blob(['\uFEFF' + csvString], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
