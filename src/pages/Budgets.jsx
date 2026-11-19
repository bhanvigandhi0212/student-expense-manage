
import { useMemo, useState } from 'react';
import {
  Wallet,
  Receipt,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Trash2,
} from 'lucide-react';

import { useExpense } from '../context/ExpenseContext';
import StatCard from '../components/StatCard';

import {
  EXPENSE_CATEGORIES,
  CURRENCIES,
} from '../utils/onstants-temp.js';

import {
  filterByMonth,
  getCurrentMonthKey,
  getMonthLabel,
  formatCurrency,
} from '../utils/calculations';

const MAX_BUDGET = 10000000;

function getStatus(spent, limit) {
  if (limit <= 0) {
    return {
      percent: 0,
      remaining: 0,
      status: 'none',
    };
  }

  const percent = (spent / limit) * 100;

  return {
    percent,
    remaining: limit - spent,
    status:
      percent > 100
        ? 'exceeded'
        : percent >= 80
          ? 'warning'
          : 'safe',
  };
}

function Budgets() {
  const {
    transactions,
    budgets,
    settings,
    updateBudgets,
    setCategoryBudget,
  } = useExpense();

  const [monthlyInput, setMonthlyInput] = useState(
    String(budgets.monthly || '')
  );

  const [categoryInputs, setCategoryInputs] = useState(
    budgets.categories || {}
  );

  const [message, setMessage] = useState('');

  const monthKey = getCurrentMonthKey();
  const monthLabel = getMonthLabel(monthKey);

  const symbol =
    CURRENCIES.find((c) => c.code === settings.currency)?.symbol || '₹';

  const money = (amount) =>
    formatCurrency(amount, settings.currency || 'INR');

  const monthExpenses = useMemo(
    () =>
      filterByMonth(transactions, monthKey).filter(
        (t) => t.type === 'expense'
      ),
    [transactions, monthKey]
  );

  const totalSpent = monthExpenses.reduce(
    (sum, t) => sum + Number(t.amount || 0),
    0
  );

  const monthlyLimit = Number(budgets.monthly) || 0;

  const monthlyStatus = getStatus(totalSpent, monthlyLimit);

  const categoryData = EXPENSE_CATEGORIES.map((cat) => {
    const spent = monthExpenses
      .filter((t) => t.category === cat.id)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const limit = Number(budgets.categories?.[cat.id]) || 0;

    return {
      ...cat,
      spent,
      limit,
      ...getStatus(spent, limit),
    };
  });

  const categoryTotal = categoryData.reduce(
    (sum, cat) => sum + cat.limit,
    0
  );

  const saveMonthlyBudget = () => {
    const amount = Number(monthlyInput);

    if (!monthlyInput.trim() || !Number.isFinite(amount) || amount <= 0) {
      setMessage('Please enter a valid monthly budget.');
      return;
    }

    if (amount > MAX_BUDGET) {
      setMessage('Budget amount is too large.');
      return;
    }

    updateBudgets({ monthly: amount });
    setMessage('Monthly budget saved successfully!');
  };

  const saveCategoryBudget = (cat) => {
    const amount = Number(categoryInputs[cat.id]);

    if (
      !String(categoryInputs[cat.id] ?? '').trim() ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setMessage(`Enter a valid budget for ${cat.label}.`);
      return;
    }

    if (amount > MAX_BUDGET) {
      setMessage('Budget amount is too large.');
      return;
    }

    setCategoryBudget(cat.id, amount);
    setMessage(`${cat.label} budget saved successfully!`);
  };

  const removeCategoryBudget = (cat) => {
    setCategoryBudget(cat.id, 0);

    setCategoryInputs((prev) => ({
      ...prev,
      [cat.id]: '',
    }));

    setMessage(`${cat.label} budget removed.`);
  };

  const removeMonthlyBudget = () => {
    updateBudgets({ monthly: 0 });
    setMonthlyInput('');
    setMessage('Monthly budget removed.');
  };

  return (
    <div className="budgets-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">
            Plan your spending and track your limits for {monthLabel}.
          </p>
        </div>
      </div>

      {message && (
        <div className="budget-notice">
          {message}
          <button onClick={() => setMessage('')}>×</button>
        </div>
      )}

      <div className="stat-grid three">
        <StatCard
          title="Monthly budget"
          value={money(monthlyLimit)}
          subtitle={monthLabel}
          icon={Wallet}
          tone="primary"
        />

        <StatCard
          title="Total spent"
          value={money(totalSpent)}
          subtitle="This month"
          icon={Receipt}
          tone="danger"
        />

        <StatCard
          title={monthlyStatus.status === 'exceeded' ? 'Over budget' : 'Remaining'}
          value={
            monthlyLimit > 0
              ? money(Math.abs(monthlyStatus.remaining))
              : '-'
          }
          subtitle={
            monthlyLimit > 0
              ? `${Math.round(monthlyStatus.percent)}% used`
              : 'Set a monthly budget'
          }
          icon={monthlyStatus.status === 'exceeded' ? AlertOctagon : CheckCircle}
          tone={monthlyStatus.status === 'exceeded' ? 'danger' : 'success'}
        />
      </div>

      <section className="card budget-section">
        <div className="card-header">
          <div>
            <h3 className="card-title">Monthly budget</h3>
            <p className="card-subtitle">
              Set your total spending limit.
            </p>
          </div>
        </div>

        <div className="budget-input-row">
          <div className="budget-input-prefix">
            <span>{symbol}</span>
            <input
              type="number"
              min="1"
              placeholder="Enter monthly budget"
              value={monthlyInput}
              onChange={(e) => setMonthlyInput(e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={saveMonthlyBudget}
          >
            Save budget
          </button>

          {monthlyLimit > 0 && (
            <button
              className="btn btn-outline"
              onClick={removeMonthlyBudget}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {monthlyLimit > 0 && (
          <div className="budget-progress-block">
            <div className="budget-progress-heading">
              <span>Overall spending</span>
              <strong>{Math.round(monthlyStatus.percent)}%</strong>
            </div>

            <div className="budget-progress-track">
              <div
                className={`budget-progress-fill ${monthlyStatus.status}`}
                style={{
                  width: `${Math.min(monthlyStatus.percent, 100)}%`,
                }}
              />
            </div>

            <div className="budget-progress-info">
              <span>{money(totalSpent)} spent</span>
              <span>
                {monthlyStatus.status === 'exceeded'
                  ? `${money(Math.abs(monthlyStatus.remaining))} over`
                  : `${money(monthlyStatus.remaining)} left`}
              </span>
            </div>
          </div>
        )}
      </section>

      <div className="budget-category-heading">
        <div>
          <h3>Category budgets</h3>
          <p>Set individual spending limits for each category.</p>
        </div>
        <strong>{money(categoryTotal)} allocated</strong>
      </div>

      <div className="budget-category-grid">
        {categoryData.map((cat) => (
          <div className="card budget-category-card" key={cat.id}>
            <div className="budget-category-top">
              <div>
                <h4>{cat.label}</h4>
                <p>{money(cat.spent)} spent</p>
              </div>

              <span className={`budget-status ${cat.status}`}>
                {cat.status === 'none'
                  ? 'Not set'
                  : cat.status === 'exceeded'
                    ? 'Exceeded'
                    : cat.status === 'warning'
                      ? 'Warning'
                      : 'On track'}
              </span>
            </div>

            {cat.limit > 0 && (
              <>
                <div className="budget-progress-track">
                  <div
                    className={`budget-progress-fill ${cat.status}`}
                    style={{
                      width: `${Math.min(cat.percent, 100)}%`,
                    }}
                  />
                </div>

                <div className="budget-progress-info">
                  <span>{Math.round(cat.percent)}% used</span>
                  <span>
                    {cat.remaining < 0
                      ? `${money(Math.abs(cat.remaining))} over`
                      : `${money(cat.remaining)} left`}
                  </span>
                </div>
              </>
            )}

            <div className="budget-input-row category-input-row">
              <div className="budget-input-prefix">
                <span>{symbol}</span>
                <input
                  type="number"
                  min="1"
                  placeholder="Set limit"
                  value={categoryInputs[cat.id] ?? ''}
                  onChange={(e) =>
                    setCategoryInputs((prev) => ({
                      ...prev,
                      [cat.id]: e.target.value,
                    }))
                  }
                />
              </div>

              <button
                className="btn btn-outline btn-sm"
                onClick={() => saveCategoryBudget(cat)}
              >
                Save
              </button>

              {cat.limit > 0 && (
                <button
                  className="action-btn danger"
                  onClick={() => removeCategoryBudget(cat)}
                  title="Remove budget"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {monthlyStatus.status === 'warning' && (
        <div className="budget-alert warning">
          <AlertTriangle size={20} />
          You have used 80% or more of your monthly budget. Spend carefully!
        </div>
      )}

      {monthlyStatus.status === 'exceeded' && (
        <div className="budget-alert exceeded">
          <AlertOctagon size={20} />
          Your monthly budget has been exceeded!
        </div>
      )}
    </div>
  );
}

export default Budgets;
