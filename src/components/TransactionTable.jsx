
import {
  ArrowDownLeft,
  ArrowUpRight,
  Inbox,
  Pencil,
  Trash2,
} from 'lucide-react';

import { formatDate, getCategoryMeta } from '../utils/calculations';

function TransactionTable({
  transactions = [],
  onEdit,
  onDelete,
  compact = false,
  emptyTitle = 'No transactions found',
  emptyText = 'Transactions you add will show up here.',
}) {
  const showActions = Boolean(onEdit || onDelete);

  const formatMoney = (amount) =>
    `₹${Number(amount || 0).toLocaleString('en-IN')}`;

  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <Inbox size={36} />
        <h4>{emptyTitle}</h4>
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className={`tx-table ${compact ? 'compact' : ''}`}>
        <thead>
          <tr>
            <th>Transaction</th>
            <th className="col-category">Category</th>
            <th>Date</th>
            {!compact && <th className="col-method">Payment</th>}
            <th className="text-right">Amount</th>
            {showActions && <th className="text-right">Actions</th>}
          </tr>
        </thead>

        <tbody>
          {transactions.map((t) => {
            const meta = getCategoryMeta(t.type, t.category);
            const isIncome = t.type === 'income';

            return (
              <tr key={t.id}>
                <td>
                  <div className="tx-main">
                    <span className={`tx-icon ${t.type}`}>
                      {isIncome
                        ? <ArrowDownLeft size={18} />
                        : <ArrowUpRight size={18} />}
                    </span>

                    <div>
                      <div className="tx-desc">
                        {t.description || meta.label}
                      </div>
                      <div className="tx-sub">{meta.label}</div>
                    </div>
                  </div>
                </td>

                <td className="col-category">
                  <span
                    className="badge"
                    style={{
                      background: `${meta.color}1f`,
                      color: meta.color,
                    }}
                  >
                    {meta.label}
                  </span>
                </td>

                <td className="tx-date">{formatDate(t.date)}</td>

                {!compact && (
                  <td className="col-method">
                    {t.paymentMethod || '-'}
                  </td>
                )}

                <td
                  className={`text-right tx-amount ${
                    isIncome ? 'text-success' : 'text-danger'
                  }`}
                >
                  {isIncome ? '+' : '-'}
                  {formatMoney(t.amount)}
                </td>

                {showActions && (
                  <td>
                    <div className="tx-actions">
                      {onEdit && (
                        <button
                          className="action-btn"
                          onClick={() => onEdit(t)}
                          aria-label="Edit transaction"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                      )}

                      {onDelete && (
                        <button
                          className="action-btn danger"
                          onClick={() => onDelete(t)}
                          aria-label="Delete transaction"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionTable;
