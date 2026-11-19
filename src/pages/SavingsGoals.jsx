
import { useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Pencil,
  PiggyBank,
  Plus,
  Target,
  Trash2,
  Trophy,
  Wallet,
} from 'lucide-react';

import { useExpense } from '../context/ExpenseContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatCard from '../components/StatCard';
import Toast from '../components/Toast';

import { CURRENCIES } from '../utils/onstants-temp.js';

import {
  formatCurrency,
  formatDate,
  getGoalProgress,
  getTodayString,
} from '../utils/calculations';

const MAX_AMOUNT = 100000000;

const SUGGESTIONS = [
  'Buy a Laptop',
  'Buy a Smartphone',
  'College Trip',
  'Emergency Fund',
];

const round2 = (n) => Math.round(n * 100) / 100;

// Create / Edit form
function GoalForm({ initialData, symbol, onSubmit, onCancel }) {
  const [values, setValues] = useState({
    title: initialData?.title || '',
    targetAmount: initialData ? String(initialData.targetAmount) : '',
    savedAmount: initialData ? String(initialData.savedAmount) : '',
    targetDate: initialData?.targetDate || '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    const target = Number(values.targetAmount);
    const saved =
      values.savedAmount.trim() === ''
        ? 0
        : Number(values.savedAmount);

    if (!values.title.trim()) {
      next.title = 'Enter a goal name.';
    }

    if (values.targetAmount.trim() === '') {
      next.targetAmount = 'Enter a target amount.';
    } else if (!Number.isFinite(target) || target <= 0) {
      next.targetAmount = 'Target must be greater than 0.';
    } else if (target > MAX_AMOUNT) {
      next.targetAmount = 'That amount is too large.';
    }

    if (!Number.isFinite(saved) || saved < 0) {
      next.savedAmount = "Saved amount can't be negative.";
    } else if (Number.isFinite(target) && target > 0 && saved > target) {
      next.savedAmount = "Saved amount can't be more than the target.";
    }

    if (!values.targetDate) {
      next.targetDate = 'Select a target date.';
    } else if (
      values.targetDate !== initialData?.targetDate &&
      values.targetDate < getTodayString()
    ) {
      next.targetDate = "Target date can't be in the past.";
    }

    return next;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      title: values.title.trim(),
      targetAmount: round2(Number(values.targetAmount)),
      savedAmount:
        values.savedAmount.trim() === ''
          ? 0
          : round2(Number(values.savedAmount)),
      targetDate: values.targetDate,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="goal-title">Goal name</label>

        <input
          id="goal-title"
          name="title"
          type="text"
          maxLength={40}
          placeholder="e.g. Buy a Laptop"
          className={`input ${errors.title ? 'has-error' : ''}`}
          value={values.title}
          onChange={handleChange}
          autoFocus
        />

        {errors.title && (
          <span className="error-text" role="alert">
            {errors.title}
          </span>
        )}

        {!initialData && (
          <div className="chip-row" aria-label="Goal ideas">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="chip"
                onClick={() => {
                  setValues((prev) => ({
                    ...prev,
                    title: suggestion,
                  }));
                  setErrors((prev) => ({ ...prev, title: '' }));
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="goal-target">Target amount</label>

          <div className="input-prefix">
            <span>{symbol}</span>
            <input
              id="goal-target"
              name="targetAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="60000"
              className={`input ${errors.targetAmount ? 'has-error' : ''}`}
              value={values.targetAmount}
              onChange={handleChange}
            />
          </div>

          {errors.targetAmount && (
            <span className="error-text" role="alert">
              {errors.targetAmount}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="goal-saved">Already saved (optional)</label>

          <div className="input-prefix">
            <span>{symbol}</span>
            <input
              id="goal-saved"
              name="savedAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              className={`input ${errors.savedAmount ? 'has-error' : ''}`}
              value={values.savedAmount}
              onChange={handleChange}
            />
          </div>

          {errors.savedAmount && (
            <span className="error-text" role="alert">
              {errors.savedAmount}
            </span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="goal-date">Target date</label>

        <input
          id="goal-date"
          name="targetDate"
          type="date"
          min={initialData ? undefined : getTodayString()}
          className={`input ${errors.targetDate ? 'has-error' : ''}`}
          value={values.targetDate}
          onChange={handleChange}
        />

        {errors.targetDate && (
          <span className="error-text" role="alert">
            {errors.targetDate}
          </span>
        )}
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-outline"
          onClick={onCancel}
        >
          Cancel
        </button>

        <button type="submit" className="btn btn-primary">
          {initialData ? 'Save changes' : 'Create goal'}
        </button>
      </div>
    </form>
  );
}

// Add funds form
function AddFundsForm({ goal, symbol, formatMoney, onSubmit, onCancel }) {
  const { remaining } = getGoalProgress(goal);

  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const amount = Number(value);

    if (value.trim() === '') {
      setError('Enter an amount.');
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }

    if (amount > remaining) {
      setError(`Only ${formatMoney(remaining)} is left to reach this goal.`);
      return;
    }

    onSubmit(round2(amount));
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p className="funds-hint">
        <strong>{formatMoney(goal.savedAmount)}</strong> saved of{' '}
        <strong>{formatMoney(goal.targetAmount)}</strong>.{' '}
        {formatMoney(remaining)} to go.
      </p>

      <div className="form-group">
        <label htmlFor="funds-amount">Amount to add</label>

        <div className="input-prefix">
          <span>{symbol}</span>
          <input
            id="funds-amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            className={`input ${error ? 'has-error' : ''}`}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError('');
            }}
            autoFocus
          />
        </div>

        {error && (
          <span className="error-text" role="alert">
            {error}
          </span>
        )}

        <div className="chip-row">
          <button
            type="button"
            className="chip"
            onClick={() => {
              setValue(String(round2(remaining)));
              setError('');
            }}
          >
            Add remaining ({formatMoney(remaining)})
          </button>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-outline"
          onClick={onCancel}
        >
          Cancel
        </button>

        <button type="submit" className="btn btn-primary">
          Add funds
        </button>
      </div>
    </form>
  );
}

// Goal card
function GoalCard({ goal, formatMoney, onAddFunds, onEdit, onDelete }) {
  const { percent, remaining, completed, daysLeft } =
    getGoalProgress(goal);

  let dateNote = '';

  if (completed) dateNote = 'Goal reached';
  else if (daysLeft === null) dateNote = '';
  else if (daysLeft < 0) dateNote = `Overdue by ${Math.abs(daysLeft)} days`;
  else if (daysLeft === 0) dateNote = 'Due today';
  else dateNote = `${daysLeft} days left`;

  const overdue = !completed && daysLeft !== null && daysLeft < 0;

  let suggestion = '';

  if (!completed && daysLeft !== null && daysLeft > 0) {
    const months = Math.max(daysLeft / 30, 1);
    suggestion = `Save about ${formatMoney(Math.ceil(remaining / months))} per month to reach this on time.`;
  }

  return (
    <div className={`card goal-card ${completed ? 'completed' : ''}`}>
      <div className="goal-head">
        <span className={`goal-icon ${completed ? 'done' : ''}`}>
          {completed ? <Trophy size={22} /> : <Target size={22} />}
        </span>

        <div className="goal-title-wrap">
          <h3 className="goal-title">{goal.title}</h3>

          <span className={`goal-date ${overdue ? 'overdue' : ''}`}>
            <CalendarDays size={14} />
            {formatDate(goal.targetDate)}
            {dateNote && ` · ${dateNote}`}
          </span>
        </div>

        <div className="tx-actions">
          <button
            className="action-btn"
            onClick={() => onEdit(goal)}
            aria-label={`Edit ${goal.title}`}
            title="Edit"
          >
            <Pencil size={15} />
          </button>

          <button
            className="action-btn danger"
            onClick={() => onDelete(goal)}
            aria-label={`Delete ${goal.title}`}
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="goal-amounts">
        <span className="goal-saved">{formatMoney(goal.savedAmount)}</span>
        <span className="goal-target">
          of {formatMoney(goal.targetAmount)}
        </span>
        <span className={`goal-percent ${completed ? 'done' : ''}`}>
          {Math.round(percent)}%
        </span>
      </div>

      <div
        className="bp-track"
        role="progressbar"
        aria-label={`${goal.title} progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
      >
        <div
          className={`goal-fill ${completed ? 'done' : ''}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="goal-facts">
        <div>
          <span className="figure-label">Saved</span>
          <strong>{formatMoney(goal.savedAmount)}</strong>
        </div>

        <div>
          <span className="figure-label">Remaining</span>
          <strong>{formatMoney(remaining)}</strong>
        </div>
      </div>

      {suggestion && <p className="goal-suggestion">{suggestion}</p>}

      {completed ? (
        <div className="goal-done-note">
          <CheckCircle2 size={18} />
          You've reached this goal. Well done!
        </div>
      ) : (
        <button
          className="btn btn-primary goal-add-btn"
          onClick={() => onAddFunds(goal)}
        >
          <Plus size={17} /> Add funds
        </button>
      )}
    </div>
  );
}

// Main page
function SavingsGoals() {
  const {
    settings,
    goals,
    addGoal,
    updateGoal,
    addToGoal,
    deleteGoal,
  } = useExpense();

  const [formMode, setFormMode] = useState(null);
  const [fundsGoal, setFundsGoal] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [toast, setToast] = useState('');

  const currency = settings?.currency || 'INR';

  const symbol =
    CURRENCIES.find((c) => c.code === currency)?.symbol || '₹';

  const formatMoney = (amount) => formatCurrency(amount, currency);

  const sortedGoals = useMemo(() => {
    const rank = (goal) =>
      getGoalProgress(goal).completed ? 1 : 0;

    return [...goals].sort(
      (a, b) =>
        rank(a) - rank(b) ||
        (a.targetDate || '').localeCompare(b.targetDate || '')
    );
  }, [goals]);

  const summary = useMemo(() => {
    const saved = goals.reduce(
      (sum, goal) => sum + Number(goal.savedAmount || 0),
      0
    );

    const target = goals.reduce(
      (sum, goal) => sum + Number(goal.targetAmount || 0),
      0
    );

    const completedCount = goals.filter(
      (goal) => getGoalProgress(goal).completed
    ).length;

    return {
      saved,
      target,
      completedCount,
      percent:
        target > 0
          ? Math.min(Math.round((saved / target) * 100), 100)
          : 0,
    };
  }, [goals]);

  const editingGoal =
    formMode && formMode !== 'add' ? formMode : null;

  const handleSaveGoal = (data) => {
    if (editingGoal) {
      updateGoal(editingGoal.id, data);
      setToast('Goal updated successfully.');
    } else {
      addGoal(data);
      setToast('Goal created successfully.');
    }

    setFormMode(null);
  };

  const handleAddFunds = (amount) => {
    const { remaining } = getGoalProgress(fundsGoal);

    addToGoal(fundsGoal.id, amount);

    setToast(
      amount >= remaining - 0.001
        ? `Congratulations! "${fundsGoal.title}" is complete.`
        : `Added ${formatMoney(amount)} to ${fundsGoal.title}.`
    );

    setFundsGoal(null);
  };

  const confirmDelete = () => {
    if (!toDelete) return;

    deleteGoal(toDelete.id);
    setToast('Goal deleted.');
    setToDelete(null);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Savings Goals</h1>
          <p className="page-subtitle">
            Save towards the things that matter.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setFormMode('add')}
        >
          <Plus size={18} /> New goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="card empty-state">
          <PiggyBank size={40} />
          <h4>Start your first savings goal</h4>
          <p>
            Saving for a laptop, a trip or an emergency fund?
            Create a goal and track your progress.
          </p>

          <div className="empty-actions">
            <button
              className="btn btn-primary"
              onClick={() => setFormMode('add')}
            >
              Create goal
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="stat-grid">
            <StatCard
              title="Total saved"
              value={formatMoney(summary.saved)}
              subtitle={`Across ${goals.length} ${goals.length === 1 ? 'goal' : 'goals'}`}
              icon={PiggyBank}
              tone="success"
            />

            <StatCard
              title="Total target"
              value={formatMoney(summary.target)}
              subtitle="Combined goal amount"
              icon={Wallet}
              tone="primary"
            />

            <StatCard
              title="Overall progress"
              value={`${summary.percent}%`}
              subtitle={`${formatMoney(Math.max(summary.target - summary.saved, 0))} to go`}
              icon={Target}
              tone="warning"
            />

            <StatCard
              title="Goals completed"
              value={`${summary.completedCount} / ${goals.length}`}
              subtitle={
                summary.completedCount === goals.length
                  ? 'All goals reached'
                  : 'Keep going'
              }
              icon={Trophy}
              tone="success"
            />
          </div>

          <div className="goal-grid">
            {sortedGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                formatMoney={formatMoney}
                onAddFunds={setFundsGoal}
                onEdit={setFormMode}
                onDelete={setToDelete}
              />
            ))}
          </div>
        </>
      )}

      <Modal
        isOpen={formMode !== null}
        onClose={() => setFormMode(null)}
        title={editingGoal ? 'Edit goal' : 'New savings goal'}
      >
        {formMode !== null && (
          <GoalForm
            key={editingGoal ? editingGoal.id : 'new'}
            initialData={editingGoal}
            symbol={symbol}
            onSubmit={handleSaveGoal}
            onCancel={() => setFormMode(null)}
          />
        )}
      </Modal>

      <Modal
        isOpen={Boolean(fundsGoal)}
        onClose={() => setFundsGoal(null)}
        title={fundsGoal ? `Add funds: ${fundsGoal.title}` : 'Add funds'}
        size="sm"
      >
        {fundsGoal && (
          <AddFundsForm
            key={fundsGoal.id}
            goal={fundsGoal}
            symbol={symbol}
            formatMoney={formatMoney}
            onSubmit={handleAddFunds}
            onCancel={() => setFundsGoal(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete goal"
        message={
          toDelete
            ? `Delete "${toDelete.title}"? Its saved amount (${formatMoney(toDelete.savedAmount)}) will no longer be tracked.`
            : ''
        }
      />

      <Toast
        message={toast}
        onClose={() => setToast('')}
      />
    </div>
  );
}

export default SavingsGoals;
