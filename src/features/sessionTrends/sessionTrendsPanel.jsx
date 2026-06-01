import { useState, useEffect, useMemo } from "react";
import "./sessionTrendsPanel.css";
import {
  fetchNbpRates,
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
  return end;
}

function getPeriodOffset(period) {
  switch (period) {
    case "1w": return { days: 7 };
    case "2w": return { days: 14 };
    case "1m": return { months: 1 };
    case "1q": return { months: 3 };
    case "6m": return { months: 6 };
    case "1y": return { years: 1 };
    default: return { days: 0 };
  }
}

export default function SessionTrendsPanel({ isLoading: externalLoading = false }) {
  const today = useMemo(() => new Date("2026-06-02"), []);

  const [currency, setCurrency] = useState("USD");
  const [internalStartDate, setInternalStartDate] = useState("2026-05-01");
  const [period, setPeriod] = useState("1m");
  const [internalLoading, setInternalLoading] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  const isLoading = externalLoading || internalLoading;

  const currencies = ["USD", "AUD", "CAD", "EUR", "HUF", "CHF", "GBP", "JPY", "CZK", "DKK", "NOK", "SEK"];
  const periods = ["1w", "2w", "1m", "1q", "6m", "1y"];

  const maxStartDate = useMemo(() => {
    const d = new Date(today);
    const offset = getPeriodOffset(period);
    if (offset.days) d.setDate(d.getDate() - offset.days);
    if (offset.months) d.setMonth(d.getMonth() - offset.months);
    if (offset.years) d.setFullYear(d.getFullYear() - offset.years);
    return d.toISOString().split("T")[0];
  }, [period, today]);

  const startDate = internalStartDate > maxStartDate ? maxStartDate : internalStartDate;

  useEffect(() => {
    async function loadData() {
      setInternalLoading(true);
      setError(null);
      try {
        const endDate = calculateEndDate(startDate, period).toISOString().split("T")[0];
        const rates = await fetchNbpRates(currency, startDate, endDate);
        setData(rates);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to fetch data: " + err.message);
        setData([]);
      } finally {
        setInternalLoading(false);
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
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="start-date">Start date</label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setInternalStartDate(e.target.value)}
            min="2002-01-02"
            max={maxStartDate}
            disabled={isLoading}
          />
        </div>

        <div className="time-periods">
          {periods.map((p) => {
            const tempD = new Date(today);
            const offset = getPeriodOffset(p);
            if (offset.days) tempD.setDate(tempD.getDate() - offset.days);
            if (offset.months) tempD.setMonth(tempD.getMonth() - offset.months);
            if (offset.years) tempD.setFullYear(tempD.getFullYear() - offset.years);
            
            const isValid = startDate <= tempD.toISOString().split("T")[0];

            return (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                disabled={isLoading || !isValid}
                className={period === p ? "active" : ""}
                title={!isValid ? "Start date is too recent for this period" : ""}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="chart-area-loading">
          <div data-testid="session-trends-spinner" className="spinner">Loading data...</div>
        </div>
      ) : (
        <>
          {error && <div className="error-message">{error}</div>}
          <div className="chart-container" data-testid="session-trends-chart">
            {data && data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
                    type="linear"
                    dataKey="rate"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "var(--accent)", strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "var(--accent)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">No data available for the selected period.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
