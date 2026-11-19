
import { generateId, getTodayString, shiftMonth } from './calculations';

const today = getTodayString();
const currentMonth = today.slice(0, 7);

function dateInMonth(monthKey, day) {
  const [year, month] = monthKey.split('-').map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  const safeDay = Math.min(day, lastDay);

  return `${year}-${String(month).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
}

function createTransaction(type, category, amount, description, date, paymentMethod = 'UPI') {
  return {
    id: generateId(),
    type,
    category,
    amount,
    description,
    date,
    paymentMethod,
    createdAt: new Date().toISOString(),
  };
}

export function createSampleTransactions() {
  const transactions = [];

  const expenses = [
    ['food', 120, 'Lunch at college', 3],
    ['transport', 80, 'Metro recharge', 5],
    ['books', 450, 'Semester notes', 7],
    ['food', 180, 'Dinner with friends', 9],
    ['shopping', 650, 'Clothing', 12],
    ['mobile', 299, 'Mobile recharge', 15],
    ['entertainment', 250, 'Movie ticket', 18],
    ['food', 150, 'Snacks', 21],
    ['healthcare', 300, 'Medicines', 24],
    ['transport', 100, 'Auto fare', 26],
  ];

  for (let i = 0; i < 6; i++) {
    const month = shiftMonth(currentMonth, -i);

    transactions.push(
      createTransaction(
        'income',
        i % 2 === 0 ? 'pocket-money' : 'parents',
        5000 + i * 500,
        i % 2 === 0 ? 'Monthly pocket money' : 'Money from parents',
        dateInMonth(month, 1),
      ),
    );

    expenses.forEach(([category, amount, description, day]) => {
      transactions.push(
        createTransaction(
          'expense',
          category,
          amount + i * 10,
          description,
          dateInMonth(month, day),
        ),
      );
    });

    transactions.push(
      createTransaction(
        'income',
        'part-time',
        2000,
        'Part-time earnings',
        dateInMonth(month, 20),
      ),
    );
  }

  return transactions;
}

export function createSampleBudgets() {
  return {
    monthly: 10000,
    categories: {
      food: 2500,
      transport: 1000,
      fees: 3000,
      books: 1000,
      shopping: 1000,
      entertainment: 500,
      accommodation: 5000,
      mobile: 500,
      healthcare: 500,
      other: 1000,
    },
  };
}

export function createSampleGoals() {
  return [
    {
      id: generateId(),
      name: 'New Laptop',
      targetAmount: 60000,
      savedAmount: 15000,
      targetDate: dateInMonth(shiftMonth(currentMonth, 5), 1),
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Emergency Fund',
      targetAmount: 20000,
      savedAmount: 5000,
      targetDate: dateInMonth(shiftMonth(currentMonth, 3), 1),
      createdAt: new Date().toISOString(),
    },
  ];
}
