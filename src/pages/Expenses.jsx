
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Hash, Plus, Receipt, Tag } from 'lucide-react';

import { useExpense } from '../context/ExpenseContext';

import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import StatCard from '../components/StatCard';
import TransactionForm from '../components/TransactionForm';
import TransactionTable from '../components/TransactionTable';

import { EXPENSE_CATEGORIES } from '../utils/onstants-temp.js';

import {
  filterByMonth,
  getCurrentMonthKey,
  getCategoryBreakdown,
  getCategoryMeta,
  getMonthLabel,
  formatCurrency,
} from '../utils/calculations';

function Expenses() {
  const {
    transactions,
    settings,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useExpense();

  const location = useLocation();
  const navigate = useNavigate();

  const selectedMonth = getCurrentMonthKey();
  const monthLabel = getMonthLabel(selectedMonth);

  const formatMoney = (amount) =>
    formatCurrency(amount, settings.currency || 'INR');

  const [modalOpen, setModalOpen] = useState(
    Boolean(location.state?.openAdd)
  );

  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [toast, setToast] = useState('');

  const closeToast = useCallback(() => setToast(''), []);

  useEffect(() => {
    if (location.state?.openAdd) {
      navigate(location.pathname, {
        replace: true,
        state: null,
      });
    }
  }, [location, navigate]);

  const monthTransactions = useMemo(
    () => filterByMonth(transactions, selectedMonth),
    [transactions, selectedMonth]
  );

  const monthExpenses = useMemo(
    () => monthTransactions.filter((t) => t.type === 'expense'),
    [monthTransactions]
  );

  const total = useMemo(
    () => monthExpenses.reduce((sum, t) => sum + Number(t.amount), 0),
    [monthExpenses]
  );

  const topCategory = useMemo(
    () => getCategoryBreakdown(monthTransactions, 'expense')[0] || null,
    [monthTransactions]
  );

  const visible = useMemo(
    () =>
      monthExpenses
        .filter(
          (t) =>
            categoryFilter === 'all' ||
            t.category === categoryFilter
        )
        .sort((a, b) => b.date.localeCompare(a.date)),
    [monthExpenses, categoryFilter]
  );

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
    if (editing) {
      updateTransaction(editing.id, data);
      setToast('Expense updated successfully');
    } else {
      addTransaction(data);
      setToast('Expense added successfully');
    }

    closeModal();
  };

  const confirmDelete = () => {
    if (!toDelete) return;

    deleteTransaction(toDelete.id);
    setToDelete(null);
    setToast('Expense deleted successfully');
  };

  const deleteName = toDelete
    ? toDelete.description ||
      getCategoryMeta('expense', toDelete.category).label
    : '';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">
            Track and manage your spending for {monthLabel}.
          </p>
        </div>

        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={18} />
          Add expense
        </button>
      </div>

      <div className="stat-grid three">
        <StatCard
          title="Total spent"
          value={formatMoney(total)}
          subtitle={monthLabel}
          icon={Receipt}
          tone="danger"
        />

        <StatCard
          title="Expenses logged"
          value={monthExpenses.length}
          subtitle="Transactions this month"
          icon={Hash}
          tone="primary"
        />

        <StatCard
          title="Top category"
          value={topCategory ? topCategory.label : '-'}
          subtitle={
            topCategory
              ? formatMoney(topCategory.value)
              : 'No expenses yet'
          }
          icon={Tag}
          tone="warning"
        />
      </div>

      <section className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">All expenses</h3>
            <p className="card-subtitle">
              {visible.length}{' '}
              {visible.length === 1 ? 'entry' : 'entries'} in{' '}
              {monthLabel}
            </p>
          </div>

          <select
            className="select inline"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>

            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <TransactionTable
          transactions={visible}
          onEdit={openEdit}
          onDelete={setToDelete}
          emptyTitle={
            monthExpenses.length === 0
              ? 'No expenses this month'
              : 'No matching expenses'
          }
          emptyText={
            monthExpenses.length === 0
              ? 'Add an expense to get started.'
              : 'Try a different category filter.'
          }
        />
      </section>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit expense' : 'Add expense'}
      >
        <TransactionForm
          key={editing?.id || 'new-expense'}
          type="expense"
          initialData={editing}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete expense"
        message={
          toDelete
            ? `Delete "${deleteName}" (${formatMoney(toDelete.amount)})? This can't be undone.`
            : ''
        }
      />

      <Toast message={toast} onClose={closeToast} />
    </div>
  );
}

export default Expenses;
