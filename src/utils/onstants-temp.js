
export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Food & Dining', color: '#f97316' },
  { id: 'transport', label: 'Transportation', color: '#0ea5e9' },
  { id: 'fees', label: 'College Fees', color: '#6366f1' },
  { id: 'books', label: 'Books & Stationery', color: '#8b5cf6' },
  { id: 'shopping', label: 'Shopping', color: '#ec4899' },
  { id: 'entertainment', label: 'Entertainment', color: '#eab308' },
  { id: 'accommodation', label: 'Accommodation', color: '#14b8a6' },
  { id: 'mobile', label: 'Mobile & Internet', color: '#3b82f6' },
  { id: 'healthcare', label: 'Healthcare', color: '#ef4444' },
  { id: 'other', label: 'Other', color: '#64748b' },
];

export const INCOME_SOURCES = [
  { id: 'pocket-money', label: 'Pocket Money', color: '#22c55e' },
  { id: 'parents', label: 'Parents', color: '#10b981' },
  { id: 'part-time', label: 'Part-time Job', color: '#06b6d4' },
  { id: 'freelancing', label: 'Freelancing', color: '#6366f1' },
  { id: 'scholarship', label: 'Scholarship', color: '#a855f7' },
  { id: 'internship', label: 'Internship', color: '#f59e0b' },
  { id: 'other-income', label: 'Other Income', color: '#64748b' },
];

export const PAYMENT_METHODS = [
  'UPI',
  'Cash',
  'Debit Card',
  'Credit Card',
  'Net Banking',
  'Wallet',
];

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', locale: 'en-IN', label: 'Indian Rupee (₹)' },
  { code: 'USD', symbol: '$', locale: 'en-US', label: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', locale: 'de-DE', label: 'Euro (€)' },
  { code: 'GBP', symbol: '£', locale: 'en-GB', label: 'British Pound (£)' },
];

export const STORAGE_KEYS = {
  transactions: 'sem_transactions',
  budgets: 'sem_budgets',
  goals: 'sem_goals',
  settings: 'sem_settings',
};

export const DEFAULT_SETTINGS = {
  name: 'Student',
  email: '',
  college: '',
  course: '',
  currency: 'INR',
  theme: 'light',
};

export const BUDGET_WARNING_THRESHOLD = 0.8;
