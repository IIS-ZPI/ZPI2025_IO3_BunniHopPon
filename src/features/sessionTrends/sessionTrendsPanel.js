import React, { useState } from "react";
import "./sessionTrendsPanel.css";

export default function SessionTrendsPanel({ isLoading = false }) {
  const [currency, setCurrency] = useState("USD");
  const [startDate, setStartDate] = useState("2024-01-01");

  const currencies = ["USD", "EUR", "GBP", "CHF", "JPY"];

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
          {["1w", "2w", "1m", "1q", "6m", "1y"].map((period) => (
            <button key={period} disabled={isLoading}>
              {period}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <div data-testid="session-trends-spinner" className="spinner">Loading...</div>}

      <div className="chart-container" data-testid="session-trends-chart">
        {/* Graph will go here */}
      </div>

      <div className="stats-grid">
        <div className="stat-item">
          <span className="label">Median</span>
          <span className="value">-</span>
        </div>
        <div className="stat-item">
          <span className="label">Mode</span>
          <span className="value">-</span>
        </div>
        <div className="stat-item">
          <span className="label">Standard deviation</span>
          <span className="value">-</span>
        </div>
        <div className="stat-item">
          <span className="label">Coefficient of variation</span>
          <span className="value">-</span>
        </div>
        <div className="stat-item">
          <span className="label">Increasing</span>
          <span className="value">-</span>
        </div>
        <div className="stat-item">
          <span className="label">Decreasing</span>
          <span className="value">-</span>
        </div>
        <div className="stat-item">
          <span className="label">No change</span>
          <span className="value">-</span>
        </div>
      </div>

      <div className="min-max-avg">
        <div className="stat-item">
          <span className="label">Max</span>
          <span className="value">-</span>
        </div>
        <div className="stat-item">
          <span className="label">Min</span>
          <span className="value">-</span>
        </div>
        <div className="stat-item">
          <span className="label">Avg</span>
          <span className="value">-</span>
        </div>
      </div>
    </div>
  );
}
