
import { useMemo } from 'react';
import { Link } from 'react-router-dom';


import {
  ArrowRight,
  Inbox,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';

import { useExpense } from '../context/ExpenseContext';

import StatCard from '../components/StatCard';
import BudgetProgress from '../components/BudgetProgress';
import ExpenseChart from '../components/ExpenseChart';
import TransactionTable from '../components/TransactionTable';

import {
  filterByMonth,
  getCurrentMonthKey,
  getMonthLabel,
  getDailySpending,
  getCategoryBreakdown,
  getMonthlyTrend,
  getAverageDailyExpense,
  getBudgetStatus,
  getCategoryBudgetStatuses,
  getTodayString,
  sumAmount,
  formatCurrency,
} from '../utils/calculations';

function ChartCard({ title, subtitle, action, children }) {
  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">{title}</h3>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
        {action}
      </div>

      {children}
    </section>
  );
}

function Dashboard() {
  const {
    settings,
    transactions,
    budgets,
    totals,
    currentMonthTransactions,
    loadSampleData,
  } = useExpense();

  const selectedMonth = getCurrentMonthKey();
  const monthLabel = getMonthLabel(selectedMonth);

  const formatMoney = (amount) =>
    formatCurrency(amount, settings.currency || 'INR');

  const monthlyIncome = sumAmount(currentMonthTransactions, 'income');
  const monthlyExpense = sumAmount(currentMonthTransactions, 'expense');
  const monthlySavings = monthlyIncome - monthlyExpense;

  const firstName =
    (settings.name || '').trim().split(' ')[0] || 'there';

  const dailyData = useMemo(
    () => getDailySpending(transactions, selectedMonth),
    [transactions, selectedMonth]
  );

  const categoryData = useMemo(
    () => getCategoryBreakdown(currentMonthTransactions, 'expense'),
    [currentMonthTransactions]
  );

  const trendData = useMemo(
    () => getMonthlyTrend(transactions, selectedMonth, 6),
    [transactions, selectedMonth]
  );

  const recent = useMemo(
    () =>
      [...currentMonthTransactions]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 6),
    [currentMonthTransactions]
  );

  const monthlyBudgetStatus = getBudgetStatus(
    monthlyExpense,
    budgets.monthly
  );

  const categoryBudgetStatuses = getCategoryBudgetStatuses(
    currentMonthTransactions,
    budgets
  );

  const closestToLimit = categoryBudgetStatuses
    .filter((category) => category.status !== 'none')
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 3);

  const avgDaily = Math.round(
    getAverageDailyExpense(transactions, selectedMonth)
  );

  const topCategory = categoryData[0] || null;

  const expenseCount = currentMonthTransactions.filter(
    (t) => t.type === 'expense'
  ).length;

  const todaySpend = transactions
    .filter(
      (t) =>
        t.type === 'expense' &&
        t.date === getTodayString()
    )
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const savingsSubtitle =
    monthlyIncome > 0
      ? `${Math.round((monthlySavings / monthlyIncome) * 100)}% of income saved`
      : 'No income recorded';

  const header = (
    <div className="page-header">
      <div>
        <h1 className="page-title">
          Welcome back, {firstName}
        </h1>
        <p className="page-subtitle">
          Here's your financial overview for {monthLabel}.
        </p>
      </div>

      <div className="page-header-actions">
        <Link to="/income" state={{ openAdd: true }} className="btn btn-outline">
          <TrendingUp size={17} />
          Add income
        </Link>

        <Link to="/expenses" state={{ openAdd: true }} className="btn btn-primary">
          <TrendingDown size={17} />
          Add expense
        </Link>
      </div>
    </div>
  );

  // Empty dashboard
  if (transactions.length === 0) {
    return (
      <div>
        {header}

        <div className="card empty-state">
          <Inbox size={40} />

          <h4>Start tracking your money</h4>

          <p>
            Add your first income or expense, or load sample
            data to explore your dashboard.
          </p>

          <div className="empty-actions">
            <Link to="/expenses" className="btn btn-primary">
              Add expense
            </Link>

            <Link to="/income" className="btn btn-outline">
              Add income
            </Link>

            <button
              className="btn btn-outline"
              onClick={loadSampleData}
            >
              Load sample data
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {header}

      {/* STAT CARDS */}
      <div className="stat-grid">
        <StatCard
          title="Total Balance"
          value={formatMoney(totals.net)}
          subtitle="All-time income minus expenses"
          icon={Wallet}
          tone="primary"
          negative={totals.net < 0}
        />

        <StatCard
          title="Total Income"
          value={formatMoney(monthlyIncome)}
          subtitle={`Earned in ${monthLabel}`}
          icon={TrendingUp}
          tone="success"
        />

        <StatCard
          title="Total Expenses"
          value={formatMoney(monthlyExpense)}
          subtitle={`Spent in ${monthLabel}`}
          icon={TrendingDown}
          tone="danger"
        />

        <StatCard
          title="Monthly Savings"
          value={formatMoney(monthlySavings)}
          subtitle={savingsSubtitle}
          icon={PiggyBank}
          tone="warning"
          negative={monthlySavings < 0}
        />
      </div>

      {/* BUDGET AND SPENDING */}
      <div className="grid-2">
        <ChartCard
          title="Budget overview"
          subtitle={`Monthly budget for ${monthLabel}`}
          action={
            <Link to="/budgets" className="link-more">
              Manage <ArrowRight size={16} />
            </Link>
          }
        >
          {monthlyBudgetStatus.status === 'none' ? (
            <div className="empty-state small">
              <p>No monthly budget set yet.</p>

              <Link to="/budgets" className="btn btn-primary btn-sm">
                Set budget
              </Link>
            </div>
          ) : (
            <>
              <div className="budget-figures">
                <div>
                  <div className="figure-label">Monthly budget</div>
                  <div className="figure-value">
                    {formatMoney(monthlyBudgetStatus.limit)}
                  </div>
                </div>

                <div>
                  <div className="figure-label">Spent</div>
                  <div className="figure-value">
                    {formatMoney(monthlyBudgetStatus.spent)}
                  </div>
                </div>

                <div>
                  <div className="figure-label">Remaining</div>
                  <div className="figure-value">
                    {formatMoney(
                      Math.abs(monthlyBudgetStatus.remaining)
                    )}
                  </div>
                </div>
              </div>

              <BudgetProgress
                label="Overall budget used"
                budget={monthlyBudgetStatus}
                showFigures={false}
              />
            </>
          )}

          <div className="budget-list">
            <div className="section-label">Closest to limit</div>

            {closestToLimit.length > 0 ? (
              closestToLimit.map((category) => (
                <BudgetProgress
                  key={category.id}
                  label={category.label}
                  color={category.color}
                  budget={category}
                  showMessage={false}
                />
              ))
            ) : (
              <p className="text-muted">
                No category budgets set yet.
              </p>
            )}
          </div>
        </ChartCard>

        <ChartCard
          title="Spending overview"
          subtitle={`Quick numbers for ${monthLabel}`}
        >
          <div className="metric-tiles">
            <div className="metric-tile">
              <div className="figure-label">Spent today</div>
              <div className="figure-value">
                {formatMoney(todaySpend)}
              </div>
              <div className="tile-hint">So far today</div>
            </div>

            <div className="metric-tile">
              <div className="figure-label">Daily average</div>
              <div className="figure-value">
                {formatMoney(avgDaily)}
              </div>
              <div className="tile-hint">Per day this month</div>
            </div>

            <div className="metric-tile">
              <div className="figure-label">Top category</div>
              <div className="figure-value tile-text">
                {topCategory ? topCategory.label : '-'}
              </div>
              <div className="tile-hint">
                {topCategory
                  ? formatMoney(topCategory.value)
                  : 'No expenses yet'}
              </div>
            </div>

            <div className="metric-tile">
              <div className="figure-label">Expenses logged</div>
              <div className="figure-value">{expenseCount}</div>
              <div className="tile-hint">
                Transactions this month
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* DAILY AND CATEGORY CHARTS */}
      <div className="grid-2">
        <ChartCard
          title="Daily spending"
          subtitle={`Expenses per day in ${monthLabel}`}
        >
          <ExpenseChart
            variant="daily"
            data={dailyData}
            height={300}
          />
        </ChartCard>

        <ChartCard
          title="Expense categories"
          subtitle="Where your money went"
        >
          <ExpenseChart
            variant="category"
            data={categoryData}
            height={220}
          />
        </ChartCard>
      </div>

      {/* MONTHLY CHARTS */}
      <div className="grid-2 equal">
        <ChartCard
          title="Income vs expenses"
          subtitle="Last 6 months"
        >
          <ExpenseChart
            variant="incomeExpense"
            data={trendData}
            height={280}
          />
        </ChartCard>

        <ChartCard
          title="Monthly expenses"
          subtitle="Spending trend over 6 months"
        >
          <ExpenseChart
            variant="monthly"
            data={trendData}
            height={252}
          />
        </ChartCard>
      </div>

      {/* RECENT TRANSACTIONS */}
      <ChartCard
        title="Recent transactions"
        subtitle={`Latest activity in ${monthLabel}`}
        action={
          <Link to="/transactions" className="link-more">
            View all <ArrowRight size={16} />
          </Link>
        }
      >
        <TransactionTable
          transactions={recent}
          compact
          emptyTitle="No transactions this month"
          emptyText="Add a new transaction to get started."
        />
      </ChartCard>
    </div>
  );
}

export default Dashboard;
