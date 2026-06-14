import { useState, useMemo } from "react";
import "./changeDistributionPanel.css";

const CURRENCIES = ["USD", "AUD", "CAD", "EUR", "HUF", "CHF", "GBP", "JPY", "CZK", "DKK", "NOK", "SEK"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const NOW = new Date();
const CURRENT_YEAR = NOW.getFullYear();
const CURRENT_MONTH = NOW.getMonth();

const QUARTER_OPTIONS = (() => {
  const currentQuarter = Math.floor(CURRENT_MONTH / 3) + 1;
  const opts = [];
  for (let y = CURRENT_YEAR; y >= 2002; y--)
    for (let q = 4; q >= 1; q--) {
      if (y === CURRENT_YEAR && q >= currentQuarter) continue;
      opts.push({ value: `${y}-Q${q}`, label: `${y} Q${q}` });
    }
  return opts;
})();

const MONTH_OPTIONS = (() => {
  const opts = [];
  for (let y = CURRENT_YEAR; y >= 2002; y--)
    for (let m = 11; m >= 0; m--) {
      if (y === CURRENT_YEAR && m >= CURRENT_MONTH) continue;
      opts.push({
        value: `${y}-${String(m + 1).padStart(2, "0")}`,
        label: `${MONTH_NAMES[m]} ${y}`,
      });
    }
  return opts;
})();

export default function ChangeDistributionPanel({
  isLoading = false,
  viewMode: initialMode = "quarterly",
  histogramBars = null,
}) {
  const [mode, setMode] = useState(initialMode);
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [quoteCurrency, setQuoteCurrency] = useState("EUR");

  const initialPeriod = useMemo(() => {
    if (initialMode === "quarterly") {
      return QUARTER_OPTIONS[0]?.value || "";
    } else {
      return MONTH_OPTIONS[0]?.value || "";
    }
  }, [initialMode]);

  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);
  const [hoveredBar, setHoveredBar] = useState(null);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === "quarterly") {
      setSelectedPeriod(QUARTER_OPTIONS[0]?.value || "");
    } else {
      setSelectedPeriod(MONTH_OPTIONS[0]?.value || "");
    }
  };

  const handleBaseCurrencyChange = (e) => {
    const val = e.target.value;
    setBaseCurrency(val);
    if (val === quoteCurrency) {
      setQuoteCurrency(CURRENCIES.find((c) => c !== val));
    }
  };

  const handleQuoteCurrencyChange = (e) => {
    const val = e.target.value;
    if (val !== baseCurrency) setQuoteCurrency(val);
  };

  const periodOptions = mode === "quarterly" ? QUARTER_OPTIONS : MONTH_OPTIONS;

  return (
    <div className="cdp">
      <h2>Monthly and Quarterly Change Distribution</h2>

      <div className="cdp-controls">
        <div className="cdp-control-group">
          <label htmlFor="cdp-base-currency">Base Currency</label>
          <select
            id="cdp-base-currency"
            value={baseCurrency}
            onChange={handleBaseCurrencyChange}
            disabled={isLoading}
          >
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="cdp-control-group">
          <label htmlFor="cdp-quote-currency">Quote Currency</label>
          <select
            id="cdp-quote-currency"
            value={quoteCurrency}
            onChange={handleQuoteCurrencyChange}
            disabled={isLoading}
          >
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="cdp-mode-toggle">
          <button onClick={() => handleModeChange("monthly")} disabled={isLoading}>
            Monthly
          </button>
          <button onClick={() => handleModeChange("quarterly")} disabled={isLoading}>
            Quarterly
          </button>
        </div>

        <div className="cdp-control-group">
          <label htmlFor="cdp-period">
            <span data-testid="period-type-label">
              {mode === "quarterly" ? "Quarter" : "Month"}
            </span>
            {" "}Calculation Period
          </label>
          <select
            id="cdp-period"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            disabled={isLoading}
          >
            {periodOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div data-testid="change-distribution-spinner" className="cdp-spinner">
          Loading data…
        </div>
      ) : (
        <div data-testid="change-distribution-chart" className="cdp-chart">
          {histogramBars ? (
            <>
              {histogramBars.map((bar, i) => (
                <div
                  key={i}
                  data-testid={bar.testId ?? `histogram-bar-${i}`}
                  className="cdp-bar"
                  onMouseEnter={() => setHoveredBar(bar)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {bar.rangeLabel}
                </div>
              ))}
              {hoveredBar && (
                <div role="tooltip" className="cdp-tooltip">
                  {hoveredBar.rangeLabel}: {hoveredBar.frequency}
                </div>
              )}
            </>
          ) : (
            <p className="cdp-no-data">No data available for the selected period.</p>
          )}
        </div>
      )}
    </div>
  );
}
