
import { useCallback, useMemo, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';

import { useExpense } from '../context/ExpenseContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import TransactionForm from '../components/TransactionForm';
import TransactionTable from '../components/TransactionTable';

import {
  EXPENSE_CATEGORIES,
  INCOME_SOURCES,
} from '../utils/onstants-temp.js';

import {
  getCategoryMeta,
  getTotals,
  formatCurrency,
} from '../utils/calculations';

const PAGE_SIZE = 15;

const TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
];

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Newest first' },
  { value: 'date-asc', label: 'Oldest first' },
  { value: 'amount-desc', label: 'Highest amount' },
  { value: 'amount-asc', label: 'Lowest amount' },
];

function Transactions() {
  const {
    transactions,
    settings,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useExpense();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [modalType, setModalType] = useState(null);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [toast, setToast] = useState('');

  const closeToast = useCallback(() => setToast(''), []);

  const formatMoney = (amount) =>
    formatCurrency(amount, settings?.currency || 'INR');

  const invalidRange = Boolean(
    dateFrom && dateTo && dateFrom > dateTo
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = transactions.filter((t) => {
      if (typeFilter !== 'all' && t.type !== typeFilter) {
        return false;
      }

      if (
        categoryFilter !== 'all' &&
        t.category !== categoryFilter
      ) {
        return false;
      }

      if (dateFrom && t.date < dateFrom) return false;
      if (dateTo && t.date > dateTo) return false;

      if (query) {
        const label = getCategoryMeta(
          t.type,
          t.category
        ).label.toLowerCase();

        const haystack = [
          t.description,
          label,
          t.paymentMethod,
          String(t.amount),
        ]
          .join(' ')
          .toLowerCase();

        if (!haystack.includes(query)) return false;
      }

      return true;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return a.date.localeCompare(b.date);

        case 'amount-desc':
          return (
            Number(b.amount) - Number(a.amount) ||
            b.date.localeCompare(a.date)
          );

        case 'amount-asc':
          return (
            Number(a.amount) - Number(b.amount) ||
            b.date.localeCompare(a.date)
          );

        default:
          return b.date.localeCompare(a.date);
      }
    });

    return result;
  }, [
    transactions,
    search,
    typeFilter,
    categoryFilter,
    dateFrom,
    dateTo,
    sortBy,
  ]);

  const totals = useMemo(
    () => getTotals(filtered),
    [filtered]
  );

  const visible = filtered.slice(0, visibleCount);

  const hasFilters =
    search.trim() !== '' ||
    typeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    dateFrom !== '' ||
    dateTo !== '' ||
    sortBy !== 'date-desc';

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setDateFrom('');
    setDateTo('');
    setSortBy('date-desc');
    setVisibleCount(PAGE_SIZE);
  };

  const formType = editing ? editing.type : modalType;
  const modalOpen = Boolean(formType);

  const openAdd = (type) => {
    setEditing(null);
    setModalType(type);
  };

  const openEdit = (transaction) => {
    setEditing(transaction);
    setModalType(null);
  };

  const closeModal = () => {
    setEditing(null);
    setModalType(null);
  };

  const handleSubmit = (data) => {
    const label =
      data.type === 'income' ? 'Income' : 'Expense';

    if (editing) {
      updateTransaction(editing.id, data);
      setToast(`${label} updated successfully`);
    } else {
      addTransaction(data);
      setToast(`${label} added successfully`);
    }

    closeModal();
  };

  const confirmDelete = () => {
    if (!toDelete) return;

    deleteTransaction(toDelete.id);
    setToDelete(null);
    setToast('Transaction deleted successfully');
  };

  const deleteName = toDelete
    ? toDelete.description ||
      getCategoryMeta(
        toDelete.type,
        toDelete.category
      ).label
    : '';

  const modalTitle = `${editing ? 'Edit' : 'Add'} ${
    formType === 'income' ? 'income' : 'expense'
  }`;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">
            Search, filter and manage all your transactions.
          </p>
        </div>

        <div className="page-header-actions">
          <button
            className="btn btn-outline"
            onClick={() => openAdd('income')}
          >
            <Plus size={17} /> Add income
          </button>

          <button
            className="btn btn-primary"
            onClick={() => openAdd('expense')}
          >
            <Plus size={17} /> Add expense
          </button>
        </div>
      </div>

      <section className="card filters-card">
        <div className="page-search">
          <Search size={18} className="search-icon" />

          <input
            type="text"
            className="search-input"
            placeholder="Search description, category, method or amount..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            aria-label="Search transactions"
          />

          {search && (
            <button
              className="search-clear"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="filters-bar">
          <div className="filter-field">
            <label>Type</label>

            <div className="seg" role="group">
              {TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`seg-btn ${
                    typeFilter === option.value ? 'active' : ''
                  }`}
                  onClick={() => setTypeFilter(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-field">
            <label htmlFor="tx-category">Category</label>

            <select
              id="tx-category"
              className="select"
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value)
              }
            >
              <option value="all">All categories</option>

              <optgroup label="Expense categories">
                {EXPENSE_CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </optgroup>

              <optgroup label="Income sources">
                {INCOME_SOURCES.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="filter-field">
            <label htmlFor="tx-from">From</label>
            <input
              id="tx-from"
              type="date"
              className="input"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div className="filter-field">
            <label htmlFor="tx-to">To</label>
            <input
              id="tx-to"
              type="date"
              className="input"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <div className="filter-field">
            <label htmlFor="tx-sort">Sort by</label>

            <select
              id="tx-sort"
              className="select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {invalidRange && (
          <p className="error-text" role="alert">
            From date cannot be after To date.
          </p>
        )}
      </section>

      <div className="summary-row">
        <div className="metric-tile">
          <div className="figure-label">Income</div>
          <div className="figure-value text-success">
            {formatMoney(totals.income)}
          </div>
        </div>

        <div className="metric-tile">
          <div className="figure-label">Expenses</div>
          <div className="figure-value text-danger">
            {formatMoney(totals.expense)}
          </div>
        </div>

        <div className="metric-tile">
          <div className="figure-label">Net</div>
          <div
            className={`figure-value ${
              totals.net < 0 ? 'text-danger' : ''
            }`}
          >
            {formatMoney(totals.net)}
          </div>
        </div>
      </div>

      <section className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">All transactions</h3>
            <p className="card-subtitle">
              Showing {visible.length} of {filtered.length}
            </p>
          </div>

          {hasFilters && (
            <button
              className="btn btn-outline btn-sm"
              onClick={clearFilters}
            >
              <X size={15} /> Clear filters
            </button>
          )}
        </div>

        <TransactionTable
          transactions={visible}
          onEdit={openEdit}
          onDelete={setToDelete}
          emptyTitle={
            transactions.length === 0
              ? 'No transactions yet'
              : 'No matching transactions'
          }
          emptyText={
            transactions.length === 0
              ? 'Add your first income or expense to get started.'
              : 'Try changing or clearing your filters.'
          }
        />

        {filtered.length > visibleCount && (
          <div className="load-more">
            <button
              className="btn btn-outline"
              onClick={() =>
                setVisibleCount((count) => count + PAGE_SIZE)
              }
            >
              Show more ({filtered.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </section>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={modalTitle}
      >
        {formType && (
          <TransactionForm
            key={editing ? editing.id : formType}
            type={formType}
            initialData={editing}
            onSubmit={handleSubmit}
            onCancel={closeModal}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete transaction"
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

export default Transactions;
