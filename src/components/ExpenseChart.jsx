
import { Inbox } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const PRIMARY = '#6366f1';
const INCOME_COLOR = '#22c55e';
const EXPENSE_COLOR = '#f43f5e';

const AXIS_TICK = {
  fill: 'var(--text-muted)',
  fontSize: 12,
};

function EmptyChart({ text, height }) {
  return (
    <div className="chart-empty" style={{ height }}>
      <Inbox size={30} />
      <p>{text}</p>
    </div>
  );
}

function ExpenseChart({ variant, data = [], height = 280 }) {
  const formatMoney = (value) =>
    `₹${Number(value || 0).toLocaleString('en-IN')}`;

  const compact = (value) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value}`;
  };

  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className="chart-tooltip">
        <div className="chart-tooltip-title">{label}</div>

        {payload.map((item, index) => (
          <div className="chart-tooltip-row" key={index}>
            <span>{item.name}</span>
            <strong>{formatMoney(item.value)}</strong>
          </div>
        ))}
      </div>
    );
  };

  // 1. Daily spending bar chart
  if (variant === 'daily') {
    if (!data.some((d) => d.amount > 0)) {
      return <EmptyChart text="No expenses recorded this month." height={height} />;
    }

    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={AXIS_TICK} />
          <YAxis tick={AXIS_TICK} tickFormatter={compact} />
          <Tooltip content={<ChartTooltip />} />
          <Bar
            dataKey="amount"
            name="Spent"
            fill={PRIMARY}
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // 2. Category donut chart
  if (variant === 'category') {
    if (data.length === 0) {
      return <EmptyChart text="No expense categories yet." height={height} />;
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
      <div>
        <div className="donut-wrap" style={{ height }}>
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={2}
              >
                {data.map((item) => (
                  <Cell key={item.id} fill={item.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="donut-center">
            <span>Total spent</span>
            <strong>{formatMoney(total)}</strong>
          </div>
        </div>

        <ul className="legend-list">
          {data.map((item) => (
            <li className="legend-item" key={item.id}>
              <span
                className="legend-dot"
                style={{ background: item.color }}
              />
              <span className="legend-name">{item.label}</span>
              <span className="legend-percent">
                {Math.round(item.percent)}%
              </span>
              <span className="legend-amount">
                {formatMoney(item.value)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // 3. Income vs expense bar chart
  if (variant === 'incomeExpense') {
    if (!data.some((d) => d.income > 0 || d.expense > 0)) {
      return <EmptyChart text="No income or expenses recorded." height={height} />;
    }

    return (
      <div>
        <div className="chart-legend">
          <span>🟢 Income</span>
          <span>🔴 Expenses</span>
        </div>

        <ResponsiveContainer width="100%" height={height - 28}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={AXIS_TICK} />
            <YAxis tick={AXIS_TICK} tickFormatter={compact} />
            <Tooltip content={<ChartTooltip />} />

            <Bar
              dataKey="income"
              name="Income"
              fill={INCOME_COLOR}
              radius={[6, 6, 0, 0]}
            />

            <Bar
              dataKey="expense"
              name="Expenses"
              fill={EXPENSE_COLOR}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // 4. Monthly expense area chart
  if (variant === 'monthly') {
    if (!data.some((d) => d.expense > 0)) {
      return <EmptyChart text="No expense history available." height={height} />;
    }

    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.35} />
              <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={AXIS_TICK} />
          <YAxis tick={AXIS_TICK} tickFormatter={compact} />
          <Tooltip content={<ChartTooltip />} />

          <Area
            type="monotone"
            dataKey="expense"
            name="Expenses"
            stroke={PRIMARY}
            strokeWidth={3}
            fill="url(#expenseGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }
    // 5. Monthly savings chart
  if (variant === 'savings') {
    if (!data.some((d) => d.savings !== 0)) {
      return (
        <EmptyChart
          text="No savings data to show yet."
          height={height}
        />
      );
    }

    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--border)"
          />

          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={AXIS_TICK}
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            tick={AXIS_TICK}
            tickFormatter={compact}
            width={48}
          />

          <Tooltip content={<ChartTooltip />} />

          <ReferenceLine
            y={0}
            stroke="var(--text-muted)"
            strokeDasharray="4 4"
          />

          <Bar
            dataKey="savings"
            name="Savings"
            fill={INCOME_COLOR}
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
          >
            {data.map((d) => (
              <Cell
                key={d.key}
                fill={d.savings >= 0 ? INCOME_COLOR : EXPENSE_COLOR}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }
  return null;
}

export default ExpenseChart;
