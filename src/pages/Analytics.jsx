
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Download,
  FileText,
  Percent,
  Receipt,
  Tag,
} from 'lucide-react';

import { useExpense } from '../context/ExpenseContext';
import ExpenseChart from '../components/ExpenseChart';
import StatCard from '../components/StatCard';
import Toast from '../components/Toast';

import {
  downloadCSV,
  getAverageDailyExpense,
  getCategoryBreakdown,
  getCategoryMeta,
  getCurrentMonthKey,
  getDailySpending,
  getMonthLabel,
  getMonthlyTrend,
  getTotals,
  filterByMonth,
  transactionsToCSV,
} from '../utils/calculations';

const RANGE_OPTIONS = [3, 6, 12];

function ChartCard({ title, subtitle, children }) {
  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">{title}</h3>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Analytics() {
  const { transactions, settings } = useExpense();

  const [range, setRange] = useState(6);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  const [toast, setToast] = useState('');

  const monthLabel = getMonthLabel(selectedMonth);

  const formatMoney = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: settings?.currency || 'INR',
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

  const monthTransactions = useMemo(
    () => filterByMonth(transactions, selectedMonth),
    [transactions, selectedMonth]
  );

  const stats = useMemo(
    () => getTotals(monthTransactions),
    [monthTransactions]
  );

  const trendData = useMemo(
    () => getMonthlyTrend(transactions, selectedMonth, range),
    [transactions, selectedMonth, range]
  );

  const dailyData = useMemo(
    () => getDailySpending(transactions, selectedMonth),
    [transactions, selectedMonth]
  );

  const categoryData = useMemo(
    () => getCategoryBreakdown(monthTransactions, 'expense'),
    [monthTransactions]
  );

  const avgDaily = getAverageDailyExpense(transactions, selectedMonth);
  const topCategory = categoryData[0] || null;

  const savingsRate =
    stats.income > 0
      ? Math.round((stats.net / stats.income) * 100)
      : null;

  const biggestExpense = useMemo(
    () =>
      monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce(
          (max, t) =>
            !max || Number(t.amount) > Number(max.amount) ? t : max,
          null
        ),
    [monthTransactions]
  );

  const exportMonth = () => {
    if (monthTransactions.length === 0) {
      setToast(`No transactions in ${monthLabel} to export`);
      return;
    }

    downloadCSV(
      `transactions-${selectedMonth}.csv`,
      transactionsToCSV(monthTransactions)
    );

    setToast(`${monthTransactions.length} transactions exported`);
  };

  const exportAll = () => {
    if (transactions.length === 0) {
      setToast('No transactions to export yet');
      return;
    }

    downloadCSV(
      'transactions-all.csv',
      transactionsToCSV(transactions)
    );

    setToast('All transactions exported');
  };

  const exportSummary = () => {
    if (!trendData.some((d) => d.income > 0 || d.expense > 0)) {
      setToast('No data in this range to export');
      return;
    }

    const rows = [
      ['Month', 'Income', 'Expenses', 'Savings'],
      ...trendData.map((d) => [
        d.key,
        d.income,
        d.expense,
        d.savings,
      ]),
    ];

    downloadCSV(
      `monthly-summary-${selectedMonth}.csv`,
      rows.map((row) => row.join(',')).join('\r\n')
    );

    setToast('Monthly summary exported');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">
            Trends and insights for {monthLabel}.
          </p>
        </div>

        <div className="page-header-actions">
          <input
            className="select inline"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            aria-label="Select month"
          />

          <select
            className="select inline"
            value={range}
            onChange={(e) => setRange(Number(e.target.value))}
            aria-label="Trend range"
          >
            {RANGE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                Last {n} months
              </option>
            ))}
          </select>

          <button className="btn btn-primary" onClick={exportMonth}>
            <Download size={17} />
            Export month
          </button>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="card empty-state">
          <h4>No data to analyse yet</h4>
          <p>Add some income and expenses, and your charts will appear here.</p>
          <div className="empty-actions">
            <Link to="/expenses" className="btn btn-primary">
              Add expense
            </Link>
            <Link to="/income" className="btn btn-outline">
              Add income
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="stat-grid">
            <StatCard
              title="Highest spending category"
              value={topCategory ? topCategory.label : '-'}
              subtitle={
                topCategory
                  ? `${formatMoney(topCategory.value)} (${Math.round(topCategory.percent)}% of spending)`
                  : 'No expenses this month'
              }
              icon={Tag}
              tone="primary"
            />

            <StatCard
              title="Average daily expense"
              value={formatMoney(Math.round(avgDaily))}
              subtitle={`Per day in ${monthLabel}`}
              icon={CalendarDays}
              tone="warning"
            />

            <StatCard
              title="Savings rate"
              value={savingsRate === null ? '-' : `${savingsRate}%`}
              subtitle={
                savingsRate === null
                  ? 'No income this month'
                  : `${formatMoney(stats.net)} saved from ${formatMoney(stats.income)}`
              }
              icon={Percent}
              tone={savingsRate !== null && savingsRate < 0 ? 'danger' : 'success'}
              negative={savingsRate !== null && savingsRate < 0}
            />

            <StatCard
              title="Biggest expense"
              value={biggestExpense ? formatMoney(biggestExpense.amount) : '-'}
              subtitle={
                biggestExpense
                  ? biggestExpense.description ||
                    getCategoryMeta('expense', biggestExpense.category).label
                  : 'No expenses this month'
              }
              icon={Receipt}
              tone="danger"
            />
          </div>

          <div className="grid-2 equal">
            <ChartCard
              title="Monthly spending trend"
              subtitle={`Last ${range} months ending ${monthLabel}`}
            >
              <ExpenseChart variant="monthly" data={trendData} height={280} />
            </ChartCard>

            <ChartCard
              title="Income vs expenses"
              subtitle={`Last ${range} months`}
            >
              <ExpenseChart
                variant="incomeExpense"
                data={trendData}
                height={280}
              />
            </ChartCard>
          </div>

          <div className="grid-2 equal">
            <ChartCard
              title="Monthly savings trend"
              subtitle="Income minus expenses (red means overspending)"
            >
              <ExpenseChart variant="savings" data={trendData} height={280} />
            </ChartCard>

            <ChartCard
              title="Category-wise expenses"
              subtitle={`Where your money went in ${monthLabel}`}
            >
              <ExpenseChart
                variant="category"
                data={categoryData}
                height={220}
              />
            </ChartCard>
          </div>

          <div style={{ marginBottom: 24 }}>
            <ChartCard
              title="Daily spending trend"
              subtitle={`Expenses per day in ${monthLabel}`}
            >
              <ExpenseChart variant="daily" data={dailyData} height={300} />
            </ChartCard>
          </div>
        </>
      )}

      <section className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Download reports</h3>
            <p className="card-subtitle">
              Export your data as CSV and open it in Excel or Google Sheets.
            </p>
          </div>
        </div>

        <div className="report-grid">
          <div className="report-item">
            <FileText size={22} />
            <div>
              <strong>{monthLabel}</strong>
              <span>All transactions for the selected month</span>
            </div>
            <button className="btn btn-outline btn-sm" onClick={exportMonth}>
              <Download size={15} /> CSV
            </button>
          </div>

          <div className="report-item">
            <FileText size={22} />
            <div>
              <strong>All transactions</strong>
              <span>Your complete history ({transactions.length} entries)</span>
            </div>
            <button className="btn btn-outline btn-sm" onClick={exportAll}>
              <Download size={15} /> CSV
            </button>
          </div>

          <div className="report-item">
            <FileText size={22} />
            <div>
              <strong>Monthly summary</strong>
              <span>Income, expenses and savings for the last {range} months</span>
            </div>
            <button className="btn btn-outline btn-sm" onClick={exportSummary}>
              <Download size={15} /> CSV
            </button>
          </div>
        </div>
      </section>

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}

export default Analytics;
