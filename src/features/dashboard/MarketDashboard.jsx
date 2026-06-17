import { useState, useEffect } from "react";
import "./MarketDashboard.css";

const SUPPORTED_CURRENCIES = ["USD", "AUD", "CAD", "EUR", "HUF", "CHF", "GBP", "JPY", "CZK", "DKK", "NOK", "SEK"];

export function MarketDashboard({ onLoadingChange }) {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState("");

  useEffect(() => {
    async function fetchMarketPulse() {
      setLoading(true);
      if (onLoadingChange) onLoadingChange(true);
      setError(null);

      try {
        const response = await fetch("https://api.nbp.pl/api/exchangerates/tables/A/last/2/?format=json");
        if (!response.ok) throw new Error("Failed to fetch market data");
        
        const tables = await response.json();
        if (tables.length < 2) throw new Error("Insufficient data for market pulse");

        const currentTable = tables[1];
        const previousTable = tables[0];
        
        setLastUpdate(currentTable.effectiveDate);

        const pulse = SUPPORTED_CURRENCIES.map(code => {
          const current = currentTable.rates.find(r => r.code === code);
          const previous = previousTable.rates.find(r => r.code === code);

          if (!current || !previous) return null;

          const change = current.mid - previous.mid;
          const pctChange = (change / previous.mid) * 100;

          return {
            code,
            name: current.currency,
            rate: current.mid,
            change,
            pctChange,
            trend: change > 0 ? "up" : change < 0 ? "down" : "stable"
          };
        }).filter(item => item !== null);

        setMarketData(pulse);
      } catch (err) {
        console.error("Pulse error:", err);
        setError("Unable to load market pulse. Please check your connection.");
      } finally {
        setLoading(false);
        if (onLoadingChange) onLoadingChange(false);
      }
    }

    fetchMarketPulse();
  }, [onLoadingChange]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner">Analyzing Global Pulse...</div>
      </div>
    );
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  const topGainer = [...marketData].sort((a, b) => b.pctChange - a.pctChange)[0];
  const topLoser = [...marketData].sort((a, b) => a.pctChange - b.pctChange)[0];

  return (
    <div className="market-dashboard">
      <div className="dashboard-header">
        <div className="header-info">
          <h2>Market Pulse</h2>
          <p>Latest performance vs PLN (Last updated: {lastUpdate})</p>
        </div>
        <div className="market-stats">
          <div className="market-stat-mini">
            <span className="label">Top Gainer</span>
            <span className="value gainer">{topGainer?.code} (+{topGainer?.pctChange.toFixed(2)}%)</span>
          </div>
          <div className="market-stat-mini">
            <span className="label">Top Loser</span>
            <span className="value loser">{topLoser?.code} ({topLoser?.pctChange.toFixed(2)}%)</span>
          </div>
        </div>
      </div>

      <div className="currency-grid">
        {marketData.map((item) => (
          <div key={item.code} className={`currency-card ${item.trend}`}>
            <div className="card-top">
              <span className="currency-code">{item.code}</span>
              <span className={`trend-indicator ${item.trend}`}>
                {item.trend === "up" ? "▲" : item.trend === "down" ? "▼" : "●"}
              </span>
            </div>
            <div className="currency-name">{item.name}</div>
            <div className="currency-rate">{item.rate.toFixed(4)} <small>PLN</small></div>
            <div className={`currency-change ${item.trend}`}>
              {item.change > 0 ? "+" : ""}{item.change.toFixed(4)} ({item.pctChange.toFixed(2)}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
