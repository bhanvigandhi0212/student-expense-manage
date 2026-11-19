
import { AlertOctagon, AlertTriangle } from 'lucide-react';

function BudgetProgress({
  label,
  color,
  budget,
  showFigures = true,
  showMessage = true,
}) {
  const {
    limit = 0,
    spent = 0,
    remaining = 0,
    percent = 0,
    status = 'none',
  } = budget;

  const barPercent = Math.min(100, Math.max(0, percent));

  const formatMoney = (amount) =>
    `₹${Number(amount || 0).toLocaleString('en-IN')}`;

  return (
    <div className="bp">
      <div className="bp-head">
        <span className="bp-label">
          {color && (
            <span
              className="bp-dot"
              style={{ background: color }}
            />
          )}
          {label}
        </span>

        {status !== 'none' && (
          <span className={`bp-percent ${status}`}>
            {Math.round(percent)}%
          </span>
        )}
      </div>

      {status === 'none' ? (
        <p className="bp-none">
          No budget set. {formatMoney(spent)} spent so far.
        </p>
      ) : (
        <>
          <div
            className="bp-track"
            role="progressbar"
            aria-label={`${label} budget used`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={barPercent}
          >
            <div
              className={`bp-fill ${status}`}
              style={{ width: `${barPercent}%` }}
            />
          </div>

          {showFigures && (
            <div className="bp-figures">
              <span>
                {formatMoney(spent)} of {formatMoney(limit)}
              </span>

              <span className={
                status === 'exceeded' ? 'text-danger' : ''
              }>
                {status === 'exceeded'
                  ? `${formatMoney(Math.abs(remaining))} over`
                  : `${formatMoney(remaining)} left`}
              </span>
            </div>
          )}

          {showMessage && status === 'warning' && (
            <div className="bp-message warning">
              <AlertTriangle size={16} />
              You've used {Math.round(percent)}% of this budget.
              Spend carefully.
            </div>
          )}

          {showMessage && status === 'exceeded' && (
            <div className="bp-message exceeded">
              <AlertOctagon size={16} />
              Budget exceeded by {formatMoney(Math.abs(remaining))}.
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BudgetProgress;
