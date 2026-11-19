import { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import {
  EXPENSE_CATEGORIES,
  INCOME_SOURCES,
  PAYMENT_METHODS,
} from '../utils/onstants-temp.js';
import { getTodayString } from '../utils/calculations';

const MAX_AMOUNT = 10000000;

function TransactionForm({ type, initialData, onSubmit, onCancel }) {
  const { settings } = useExpense();

  const isIncome = type === 'income';
  const options = isIncome ? INCOME_SOURCES : EXPENSE_CATEGORIES;
  const symbol = settings.currency === 'INR' ? '₹' : settings.currency;

  const [values, setValues] = useState(() => ({
    amount: initialData ? String(initialData.amount) : '',
    category: initialData?.category || '',
    date: initialData?.date || getTodayString(),
    paymentMethod: initialData?.paymentMethod || PAYMENT_METHODS[0],
    description: initialData?.description || '',
  }));

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const next = {};
    const amount = Number(values.amount);

    if (values.amount.trim() === '') {
      next.amount = 'Enter an amount.';
    } else if (!Number.isFinite(amount) || amount <= 0) {
      next.amount = 'Amount must be greater than 0.';
    } else if (amount > MAX_AMOUNT) {
      next.amount = 'That amount is too large.';
    }

    if (!values.category) {
      next.category = isIncome
        ? 'Select an income source.'
        : 'Select a category.';
    }

    if (!values.date) {
      next.date = 'Select a date.';
    } else if (values.date > getTodayString()) {
      next.date = "Date can't be in the future.";
    }

    return next;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      type,
      amount: Math.round(Number(values.amount) * 100) / 100,
      category: values.category,
      date: values.date,
      paymentMethod: values.paymentMethod,
      description: values.description.trim(),
    });
  };

  const id = (name) => `${type}-${name}`;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor={id('amount')}>Amount</label>

          <div className="input-prefix">
            <span>{symbol}</span>
            <input
              id={id('amount')}
              name="amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              className={`input ${errors.amount ? 'has-error' : ''}`}
              value={values.amount}
              onChange={handleChange}
              autoFocus
            />
          </div>

          {errors.amount && (
            <span className="error-text" role="alert">
              {errors.amount}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor={id('date')}>Date</label>
          <input
            id={id('date')}
            name="date"
            type="date"
            max={getTodayString()}
            className={`input ${errors.date ? 'has-error' : ''}`}
            value={values.date}
            onChange={handleChange}
          />

          {errors.date && (
            <span className="error-text" role="alert">
              {errors.date}
            </span>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor={id('category')}>
            {isIncome ? 'Source' : 'Category'}
          </label>

          <select
            id={id('category')}
            name="category"
            className={`select ${errors.category ? 'has-error' : ''}`}
            value={values.category}
            onChange={handleChange}
          >
            <option value="">
              {isIncome ? 'Select source' : 'Select category'}
            </option>

            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>

          {errors.category && (
            <span className="error-text" role="alert">
              {errors.category}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor={id('method')}>
            {isIncome ? 'Received via' : 'Payment method'}
          </label>

          <select
            id={id('method')}
            name="paymentMethod"
            className="select"
            value={values.paymentMethod}
            onChange={handleChange}
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor={id('description')}>
          Description (optional)
        </label>

        <textarea
          id={id('description')}
          name="description"
          rows={2}
          maxLength={100}
          placeholder={
            isIncome ? 'e.g. Monthly allowance' : 'e.g. Lunch at canteen'
          }
          className="textarea"
          value={values.description}
          onChange={handleChange}
        />
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
          {initialData
            ? 'Save changes'
            : isIncome
              ? 'Add income'
              : 'Add expense'}
        </button>
      </div>
    </form>
  );
}

export default TransactionForm;
