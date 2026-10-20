export default function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  accent,
}) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span className={`metric-icon ${accent}`}>
          <Icon size={17} />
        </span>
        <span className="metric-detail">{detail}</span>
      </div>
      <strong className="metric-value">{value}</strong>
      <span className="metric-label">{label}</span>
    </article>
  );
}
