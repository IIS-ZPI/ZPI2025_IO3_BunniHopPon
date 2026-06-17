import { useMemo } from "react";
import {
  countSessionTrends,
  calcMedian,
  calcMode,
  calcStdDev,
  calcCoeffOfVariation,
} from "../../core/sessionTrends.js";
import "./statisticsModule.css";

const fmt = (n, decimals = 2) => {
  if (n == null) return "—";
  return Number(n).toFixed(decimals);
};

function StatCard({ label, value, accent }) {
  return (
    <div className={`stat-card stat-card--${accent}`}>
      <span className="stat-card__label">{label}</span>
      <span className="stat-card__value">{value}</span>
    </div>
  );
}

export function StatisticsModule({ data }) {
  const stats = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        median: null,
        mode: null,
        stddev: null,
        cv: null,
        trends: null,
      };
    }

    try {
      return {
        median: calcMedian(data),
        mode: calcMode(data),
        stddev: calcStdDev(data),
        cv: calcCoeffOfVariation(data),
        trends: countSessionTrends(data),
      };
    } catch (err) {
      console.error("Error calculating statistics:", err);
      return {
        median: null,
        mode: null,
        stddev: null,
        cv: null,
        trends: null,
      };
    }
  }, [data]);

  const cvValue = stats.cv != null ? (stats.cv * 100).toFixed(2) + "%" : "—";

  return (
    <div className="statistics-module">
      <div className="stats-grid stats-grid--4">
        <StatCard label="Median" value={fmt(stats.median)} accent="blue" />
        <StatCard label="Mode" value={fmt(stats.mode)} accent="blue" />
        <StatCard
          label="Standard deviation"
          value={fmt(stats.stddev)}
          accent="blue"
        />
        <StatCard
          label="Coefficient of variation"
          value={cvValue}
          accent="blue"
        />
      </div>

      <div className="stats-grid stats-grid--3">
        <StatCard
          label="Increasing"
          value={stats.trends?.rising ?? "—"}
          accent="green"
        />
        <StatCard
          label="Decreasing"
          value={stats.trends?.falling ?? "—"}
          accent="red"
        />
        <StatCard
          label="No change"
          value={stats.trends?.unchanged ?? "—"}
          accent="gray"
        />
      </div>
    </div>
  );
}
