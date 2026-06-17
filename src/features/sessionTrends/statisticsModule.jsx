import {
  countSessionTrends,
  calcMedian,
  calcMode,
  calcStdDev,
  calcCoeffOfVariation,
} from "../../core/sessionTrends.js";
import "./statisticsModule.css";

function fmt(n, decimals = 2) {
  if (n == null) return "—";
  return Number(n).toFixed(decimals);
}

function StatCard({ label, value, accent }) {
  return (
    <div className={`stat-card stat-card--${accent}`}>
      <span className="stat-card__label">{label}</span>
      <span className="stat-card__value">{value}</span>
    </div>
  );
}

export function StatisticsModule({ data }) {
  const hasData = data && data.length > 0;

  let median = null;
  let mode = null;
  let stddev = null;
  let cv = null;
  let trends = null;

  if (hasData) {
    try { median = calcMedian(data); } catch { /* keep null */ }
    try { mode = calcMode(data); } catch { /* keep null */ }
    try { stddev = calcStdDev(data); } catch { /* keep null */ }
    try { cv = calcCoeffOfVariation(data); } catch { /* keep null */ }
    try { trends = countSessionTrends(data); } catch { /* keep null */ }
  }

  const cvValue = cv != null ? (cv * 100).toFixed(2) + "%" : "—";

  return (
    <div className="statistics-module">
      <div className="stats-grid stats-grid--4">
        <StatCard label="Median"                   value={fmt(median)}                   accent="blue" />
        <StatCard label="Mode"                     value={mode != null ? fmt(mode) : "—"} accent="blue" />
        <StatCard label="Standard deviation"       value={fmt(stddev)}                   accent="blue" />
        <StatCard label="Coefficient of variation" value={cvValue}                       accent="blue" />
      </div>

      <div className="stats-grid stats-grid--3">
        <StatCard label="Increasing" value={trends ? trends.rising    : "—"} accent="green" />
        <StatCard label="Decreasing" value={trends ? trends.falling   : "—"} accent="red" />
        <StatCard label="No change"  value={trends ? trends.unchanged : "—"} accent="gray" />
      </div>
    </div>
  );
}