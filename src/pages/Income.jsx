
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Hash, Plus, Tag, TrendingUp } from 'lucide-react';

import { useExpense } from '../context/ExpenseContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import StatCard from '../components/StatCard';
import TransactionForm from '../components/TransactionForm';
import TransactionTable from '../components/TransactionTable';

import { INCOME_SOURCES } from '../utils/onstants-temp.js';

import {
  getCategoryBreakdown,
  getCategoryMeta,
  getCurrentMonthKey,
  getMonthLabel,
  formatCurrency,
  getMonthKey,
} from '../utils/calculations';

function Income() {
  const {
    transactions,
    settings,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useExpense();

  const location = useLocation();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(
    Boolean(location.state?.openAdd)
  );
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [sourceFilter, setSourceFilter] = useState('all');
  const [toast, setToast] = useState('');

  const closeToast = useCallback(() => setToast(''), []);

  useEffect(() => {
    if (location.state?.openAdd) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  const selectedMonth = getCurrentMonthKey();
  const monthLabel = getMonthLabel(selectedMonth);

  const monthIncome = useMemo(
    () =>
      transactions.filter(
        (t) =>
          t.type === 'income' &&
          getMonthKey(t.date) === selectedMonth
      ),
    [transactions, selectedMonth]
  );

  const total = useMemo(
    () =>
      monthIncome.reduce(
        (sum, t) => sum + Number(t.amount || 0),
        0
      ),
    [monthIncome]
  );

  const sourceBreakdown = useMemo(
    () => getCategoryBreakdown(monthIncome, 'income'),
    [monthIncome]
  );

  const topSource = sourceBreakdown[0] || null;

  const visible = useMemo(
    () =>
      monthIncome
        .filter(
          (t) =>
            sourceFilter === 'all' ||
            t.category === sourceFilter
        )
        .sort((a, b) => b.date.localeCompare(a.date)),
    [monthIncome, sourceFilter]
  );

  const formatMoney = (amount) =>
    formatCurrency(amount, settings?.currency || 'INR');

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (transaction) => {
    setEditing(transaction);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSubmit = (data) => {
    const incomeData = { ...data, type: 'income' };

    if (editing) {
      updateTransaction(editing.id, incomeData);
      setToast('Income updated successfully');
    } else {
      addTransaction(incomeData);
      setToast('Income added successfully');
    }

    closeModal();
  };

  const confirmDelete = () => {
    if (!toDelete) return;

    deleteTransaction(toDelete.id);
    setToDelete(null);
    setToast('Income deleted successfully');
  };

  const deleteName = toDelete
    ? toDelete.description ||
      getCategoryMeta('income', toDelete.category).label
    : '';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Income</h1>
          <p className="page-subtitle">
            Record money coming in for {monthLabel}.
          </p>
        </div>

        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={18} />
          Add income
        </button>
      </div>

      <div className="stat-grid three">
        <StatCard
          title="Total income"
          value={formatMoney(total)}
          subtitle={monthLabel}
          icon={TrendingUp}
          tone="success"
        />

        <StatCard
          title="Income entries"
          value={monthIncome.length}
          subtitle="Recorded this month"
          icon={Hash}
          tone="primary"
        />

        <StatCard
          title="Top source"
          value={topSource ? topSource.label : '-'}
          subtitle={
            topSource
              ? formatMoney(topSource.value)
              : 'No income yet'
          }
          icon={Tag}
          tone="warning"
        />
      </div>

      {sourceBreakdown.length > 0 && (
        <section className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Income by source</h3>
              <p className="card-subtitle">
                Where your money came from in {monthLabel}
              </p>
            </div>
          </div>

          <ul
            className="legend-list"
            style={{ maxHeight: 'none', marginTop: 0 }}
          >
            {sourceBreakdown.map((item) => (
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
        </section>
      )}

      <section className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">All income</h3>
            <p className="card-subtitle">
              {visible.length}{' '}
              {visible.length === 1 ? 'entry' : 'entries'} in{' '}
              {monthLabel}
            </p>
          </div>

          <select
            className="select inline"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            aria-label="Filter by source"
          >
            <option value="all">All sources</option>

            {INCOME_SOURCES.map((source) => (
              <option key={source.id} value={source.id}>
                {source.label}
              </option>
            ))}
          </select>
        </div>

        <TransactionTable
          transactions={visible}
          onEdit={openEdit}
          onDelete={setToDelete}
          emptyTitle={
            monthIncome.length === 0
              ? 'No income this month'
              : 'No matching income'
          }
          emptyText={
            monthIncome.length === 0
              ? 'Click Add income to record your first income.'
              : 'Try a different source filter.'
          }
        />
      </section>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit income' : 'Add income'}
      >
        <TransactionForm
          type="income"
          initialData={editing}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete income"
        message={
          toDelete
            ? `Delete "${deleteName}" (${formatMoney(
                toDelete.amount
              )})? This can't be undone.`
            : ''
        }
      />

      <Toast message={toast} onClose={closeToast} />
    </div>
  );
}

export default Income;
