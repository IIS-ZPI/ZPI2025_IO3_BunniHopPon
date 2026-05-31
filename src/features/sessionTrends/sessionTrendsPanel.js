import React, { useState, useEffect } from "react";
import "./sessionTrendsPanel.css";
import {
  fetchNbpRates,
  countSessionTrends,
  calcMedian,
  calcMode,
  calcStdDev,
  calcCoeffOfVariation,
  calcMinMaxAvg
} from "../../core/sessionTrends.js";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

function calculateEndDate(startDateStr, period) {
  const start = new Date(startDateStr);
  const end = new Date(start);
  switch (period) {
    case "1w": end.setDate(start.getDate() + 7); break;
    case "2w": end.setDate(start.getDate() + 14); break;
    case "1m": end.setMonth(start.getMonth() + 1); break;
    case "1q": end.setMonth(start.getMonth() + 3); break;
    case "6m": end.setMonth(start.getMonth() + 6); break;
    case "1y": end.setFullYear(start.getFullYear() + 1); break;
    default: break;
  }
  return end.toISOString().split("T")[0];
}

export default function SessionTrendsPanel({ isLoading: externalLoading = false }) {
  const [currency, setCurrency] = useState("USD");
  const [startDate, setStartDate] = useState("2024-01-01");
  const [period, setPeriod] = useState("1m");
  const [isLoading, setIsLoading] = useState(externalLoading);
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const currencies = ["USD", "EUR", "GBP", "CHF", "JPY", "AUD", "CAD", "SEK"];
  const periods = ["1w", "2w", "1m", "1q", "6m", "1y"];

  useEffect(() => {
    setIsLoading(externalLoading);
  }, [externalLoading]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const endDate = calculateEndDate(startDate, period);
        const rates = await fetchNbpRates(currency, startDate, endDate);
        setData(rates);

        if (rates.length > 0) {
          setStats({
            counts: countSessionTrends(rates),
            median: calcMedian(rates),
            mode: calcMode(rates),
            stdDev: calcStdDev(rates),
            coeffVar: calcCoeffOfVariation(rates),
            minMaxAvg: calcMinMaxAvg(rates)
          });
        } else {
          setStats(null);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data");
        setData([]);
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [currency, startDate, period]);

  return (
    <div className="session-trends-panel">
      <div className="controls">
        <div className="control-group">
          <label htmlFor="currency-select">Exchange rate</label>
          <select
            id="currency-select"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            disabled={isLoading}
          >
            {currencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="start-date">Start date</label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min="2002-01-02"
            disabled={isLoading}
          />
        </div>

        <div className="time-periods">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              disabled={isLoading}
              className={period === p ? "active" : ""}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <div data-testid="session-trends-spinner" className="spinner">Loading...</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="chart-container" data-testid="session-trends-chart">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="var(--text)"
                tickFormatter={(str) => str.split("-").slice(1).join("-")}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fontSize: 12 }}
                stroke="var(--text)"
              />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)", borderRadius: "8px" }}
                itemStyle={{ color: "var(--accent)" }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="var(--accent)"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: "var(--accent)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          !isLoading && <div className="no-data">No data available for the selected period.</div>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-item">
          <span className="label">Median</span>
          <span className="value">{stats ? stats.median.toFixed(4) : "-"}</span>
        </div>
        <div className="stat-item">
          <span className="label">Mode</span>
          <span className="value">{stats && stats.mode !== null ? stats.mode.toFixed(4) : "N/A"}</span>
        </div>
        <div className="stat-item">
          <span className="label">Standard deviation</span>
          <span className="value">{stats ? stats.stdDev.toFixed(4) : "-"}</span>
        </div>
        <div className="stat-item">
          <span className="label">Coefficient of variation</span>
          <span className="value">{stats && stats.coeffVar !== null ? (stats.coeffVar * 100).toFixed(2) + "%" : "-"}</span>
        </div>
        <div className="stat-item">
          <span className="label">Increasing</span>
          <span className="value">{stats ? stats.counts.rising : "-"}</span>
        </div>
        <div className="stat-item">
          <span className="label">Decreasing</span>
          <span className="value">{stats ? stats.counts.falling : "-"}</span>
        </div>
        <div className="stat-item">
          <span className="label">No change</span>
          <span className="value">{stats ? stats.counts.unchanged : "-"}</span>
        </div>
      </div>

      <div className="min-max-avg">
        <div className="stat-item">
          <span className="label">Max</span>
          <span className="value">{stats ? stats.minMaxAvg.max.toFixed(4) : "-"}</span>
        </div>
        <div className="stat-item">
          <span className="label">Min</span>
          <span className="value">{stats ? stats.minMaxAvg.min.toFixed(4) : "-"}</span>
        </div>
        <div className="stat-item">
          <span className="label">Avg</span>
          <span className="value">{stats ? stats.minMaxAvg.avg.toFixed(4) : "-"}</span>
        </div>
      </div>
    </div>
  );
}
