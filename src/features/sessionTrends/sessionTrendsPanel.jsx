import { useState, useEffect, useMemo } from "react";
import "./sessionTrendsPanel.css";
import {
  fetchNbpRates,
  calcMinMaxAvg,
} from "../../core/sessionTrends.js";
import { CurrencySelect } from "../../components/CurrencySelect.jsx";
import { StatisticsModule } from "./statisticsModule.jsx";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

export function SessionTrendsPanel({ 
  isLoading: externalLoading = false,
  onLoadingChange
}) {
  const today = useMemo(() => new Date(), []);

  const [currency, setCurrency] = useState("USD");
  const [internalStartDate, setInternalStartDate] = useState("2026-05-01");
  const [period, setPeriod] = useState("1m");
  const [internalLoading, setInternalLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  const isLoading = externalLoading || internalLoading;

  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isLoading);
    }
  }, [isLoading, onLoadingChange]);

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
        const isNetworkError = !navigator.onLine || 
          err.message.toLowerCase().includes("failed to fetch") || 
          err.message.toLowerCase().includes("networkerror") ||
          err.message.toLowerCase().includes("network error");
        if (isNetworkError) {
          setError("No internet connection. Could not fetch data from NBP API.");
        } else {
          setError("Failed to fetch data: " + err.message);
        }
        setData([]);
      } finally {
        setInternalLoading(false);
      }
    }

    loadData();
  }, [currency, startDate, period]);

  let mma = null;
  if (data && data.length > 0) {
    try { mma = calcMinMaxAvg(data); } catch { /* keep null */ }
  }

  const fmtVal = (n) => (n != null ? Number(n).toFixed(2) : "—");

  return (
    <div className="session-trends-panel">
      <h2 className="session-trends-title">Rising, falling, and unchanged sessions analysis</h2>
      <div className="controls">
        <div className="control-group">
          <label htmlFor="currency-select">Exchange rate</label>
          <CurrencySelect
            id="currency-select"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            disabled={isLoading}
          />
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

        <div className="control-group">
          <label>Time period</label>
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
      </div>

      {isLoading ? (
        <div className="chart-area-loading">
          <div data-testid="session-trends-spinner" className="spinner">Loading data...</div>
        </div>
      ) : (
        <>
          {error && <div className="error-message">{error}</div>}
          <div className="chart-container" data-testid="session-trends-chart">
            <div className="chart-area">
              {data && data.length > 0 ? (
                <Line
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: "#fff",
                        titleColor: "#08060d",
                        bodyColor: "#2563eb",
                        borderColor: "#e5e4e7",
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false,
                      },
                    },
                    scales: {
                      x: {
                        grid: { display: false },
                        ticks: {
                          color: "#6b6375",
                          font: { size: 12 },
                          callback: function (val) {
                            const label = this.getLabelForValue(val);
                            return label.split("-").slice(1).join("-");
                          },
                        },
                      },
                      y: {
                        grid: { color: "#e5e4e7" },
                        ticks: {
                          color: "#6b6375",
                          font: { size: 12 },
                        },
                      },
                    },
                  }}
                  data={{
                    labels: data.map((d) => d.date),
                    datasets: [
                      {
                        label: "Rate",
                        data: data.map((d) => d.rate),
                        borderColor: "#2563eb",
                        backgroundColor: "#2563eb",
                        borderWidth: 2,
                        pointRadius: 4,
                        pointBackgroundColor: "#2563eb",
                        pointBorderWidth: 0,
                        pointHoverRadius: 6,
                        tension: 0,
                      },
                    ],
                  }}
                />
              ) : (
                <div className="no-data">No data available for the selected period.</div>
              )}
            </div>
          </div>
        </>
      )}

      <div className="chart-badges">
        <span className="chart-badge chart-badge--max">▲ Max: {fmtVal(mma?.max)}</span>
        <span className="chart-badge chart-badge--min">▼ Min: {fmtVal(mma?.min)}</span>
        <span className="chart-badge chart-badge--avg">Avg: {fmtVal(mma?.avg)}</span>
      </div>

      <StatisticsModule data={data} />
    </div>
  );
}