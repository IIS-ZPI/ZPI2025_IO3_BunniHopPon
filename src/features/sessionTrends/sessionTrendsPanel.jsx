import { useState, useEffect, useMemo, useCallback } from "react";
import "./sessionTrendsPanel.css";
import { calcMinMaxAvg } from "../../core/sessionTrends.js";
import { fetchNbpRates } from "../../core/nbpService.js";
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
  Legend,
);

const PERIOD_CONFIG = {
  "1w": { days: 7 },
  "2w": { days: 14 },
  "1m": { months: 1 },
  "1q": { months: 3 },
  "6m": { months: 6 },
  "1y": { years: 1 },
};

const PERIODS = Object.keys(PERIOD_CONFIG);

function adjustDate(date, config, direction = 1) {
  const newDate = new Date(date);
  if (config.days) newDate.setDate(newDate.getDate() + direction * config.days);
  if (config.months)
    newDate.setMonth(newDate.getMonth() + direction * config.months);
  if (config.years)
    newDate.setFullYear(newDate.getFullYear() + direction * config.years);
  return newDate;
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

export function SessionTrendsPanel({
  isLoading: externalLoading = false,
  onLoadingChange,
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
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  const maxStartDate = useMemo(() => {
    return formatDate(adjustDate(today, PERIOD_CONFIG[period], -1));
  }, [period, today]);

  const startDate =
    internalStartDate > maxStartDate ? maxStartDate : internalStartDate;

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setInternalLoading(true);
      setError(null);
      try {
        const endDate = formatDate(
          adjustDate(new Date(startDate), PERIOD_CONFIG[period], 1),
        );
        const rates = await fetchNbpRates(currency, startDate, endDate);
        if (isMounted) {
          setData(rates);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Error loading data:", err);
        const isNetworkError =
          !navigator.onLine ||
          /failed to fetch|networkerror|network error/i.test(err.message);

        setError(
          isNetworkError
            ? "No internet connection. Could not fetch data from NBP API."
            : `Failed to fetch data: ${err.message}`,
        );
        setData([]);
      } finally {
        if (isMounted) {
          setInternalLoading(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [currency, startDate, period]);

  const mma = useMemo(() => {
    if (!data || data.length === 0) return null;
    try {
      return calcMinMaxAvg(data);
    } catch (err) {
      console.error("Calculation error:", err);
      return null;
    }
  }, [data]);

  const fmtVal = useCallback(
    (n) => (n != null ? Number(n).toFixed(2) : "—"),
    [],
  );

  const chartOptions = useMemo(
    () => ({
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
          callbacks: {
            label: (context) => {
              let label = context.dataset.label || "";
              if (label) label += ": ";
              if (context.parsed.y !== null) {
                label += context.parsed.y.toFixed(4) + " PLN";
              }
              return label;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          title: {
            display: true,
            text: "Date",
            color: "#6b6375",
            font: { size: 14, weight: "bold" },
          },
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
          title: {
            display: true,
            text: "Rate (PLN)",
            color: "#6b6375",
            font: { size: 14, weight: "bold" },
          },
          ticks: {
            color: "#6b6375",
            font: { size: 12 },
            callback: (value) => value.toFixed(2) + " PLN",
          },
        },
      },
    }),
    [],
  );

  const chartData = useMemo(
    () => ({
      labels: data.map((d) => d.date),
      datasets: [
        {
          label: `1 ${currency} in PLN`,
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
    }),
    [data, currency],
  );

  return (
    <div className="session-trends-panel">
      <h2 className="session-trends-title">
        Rising, falling, and unchanged sessions analysis
      </h2>
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
            {PERIODS.map((p) => {
              const periodMaxAllowedStart = formatDate(
                adjustDate(today, PERIOD_CONFIG[p], -1),
              );
              const isValid = startDate <= periodMaxAllowedStart;

              return (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  disabled={isLoading || !isValid}
                  className={period === p ? "active" : ""}
                  title={
                    !isValid ? "Start date is too recent for this period" : ""
                  }
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
          <div data-testid="session-trends-spinner" className="spinner">
            Loading data...
          </div>
        </div>
      ) : (
        <>
          {error && <div className="error-message">{error}</div>}
          <div className="chart-container" data-testid="session-trends-chart">
            <div className="chart-area">
              {data && data.length > 0 ? (
                <Line options={chartOptions} data={chartData} />
              ) : (
                <div className="no-data">
                  No data available for the selected period.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <div className="chart-badges">
        <span className="chart-badge chart-badge--max">
          ▲ Max: {fmtVal(mma?.max)} PLN
        </span>
        <span className="chart-badge chart-badge--min">
          ▼ Min: {fmtVal(mma?.min)} PLN
        </span>
        <span className="chart-badge chart-badge--avg">
          Avg: {fmtVal(mma?.avg)} PLN
        </span>
      </div>

      <StatisticsModule data={data} />
    </div>
  );
}
