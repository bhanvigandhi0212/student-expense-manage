
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = 'primary',
  negative = false,
}) {
  return (
    <div className="card stat-card">
      <div className="stat-top">
        <span className="stat-title">{title}</span>

        <span className={`stat-icon tone-${tone}`}>
          <Icon size={20} />
        </span>
      </div>

      <div className={`stat-value ${negative ? 'negative' : ''}`}>
        {value}
      </div>

      {subtitle && (
        <div className="stat-subtitle">{subtitle}</div>
      )}
    </div>
  );
}

export default StatCard;
