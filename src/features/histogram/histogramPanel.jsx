import { useState, useEffect, useMemo } from "react";
import "./histogramPanel.css";
import { fetchNbpRates } from "../../core/sessionTrends.js";
import { getHistogramDistribution, getCrossRateHistogram } from "../../core/histogramDistribution.js";
import { CurrencySelect } from "../../components/CurrencySelect.jsx";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getQuarterRange(yearQ) {
  const [year, quarter] = yearQ.split("-Q").map(Number);
  const monthStart = { 1: 0, 2: 3, 3: 6, 4: 9 };
  const monthEnd = { 1: 2, 2: 5, 3: 8, 4: 11 };
  const start = new Date(year, monthStart[quarter], 1);
  const end = new Date(year, monthEnd[quarter] + 1, 0);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

function getMonthRange(year, month) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

function formatBinLabel(min) {
  if (min > 0) return `+${min.toFixed(1)}%`;
  return `${min.toFixed(1)}%`;
}

export function HistogramPanel({ onLoadingChange }) {
  const now = useMemo(() => new Date(), []);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [mode, setMode] = useState("quarterly");
  const [currency1, setCurrency1] = useState("USD");
  const [currency2, setCurrency2] = useState("EUR");

  const initialQuarter = (() => {
    const q = Math.floor((currentMonth - 1) / 3) + 1;
    if (q === 1) return `${currentYear - 1}-Q4`;
    return `${currentYear}-Q${q - 1}`;
  })();

  const [quarterValue, setQuarterValue] = useState(initialQuarter);
  const [monthYear, setMonthYear] = useState(currentMonth === 1 ? currentYear - 1 : currentYear);
  const [monthNum, setMonthNum] = useState(currentMonth === 1 ? 12 : currentMonth - 1);

  const [rates1, setRates1] = useState([]);
  const [rates2, setRates2] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(loading);
    }
  }, [loading, onLoadingChange]);


  const monthYearOptions = useMemo(() => {
    const opts = [];
    for (let y = currentYear; y >= 2002; y--) opts.push(y);
    return opts;
  }, [currentYear]);

  const quarterOptions = useMemo(() => {
    const currentQuarter = Math.floor((currentMonth - 1) / 3) + 1;
    const opts = [];
    for (let y = currentYear; y >= 2002; y--) {
      for (let q = 4; q >= 1; q--) {
        if (y === currentYear && q >= currentQuarter) continue;
        opts.push(`${y}-Q${q}`);
      }
    }
    return opts;
  }, [currentYear, currentMonth]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const range = mode === "quarterly"
          ? getQuarterRange(quarterValue)
          : getMonthRange(monthYear, monthNum);

        if (currency1 === currency2) {
          const r = await fetchNbpRates(currency1, range.start, range.end);
          setRates1(r);
          setRates2([]);
        } else {
          const [r1, r2] = await Promise.all([
            fetchNbpRates(currency1, range.start, range.end),
            fetchNbpRates(currency2, range.start, range.end),
          ]);
          setRates1(r1);
          setRates2(r2);
        }
      } catch (err) {
        const isNetworkError = !navigator.onLine || 
          err.message.toLowerCase().includes("failed to fetch") || 
          err.message.toLowerCase().includes("networkerror") ||
          err.message.toLowerCase().includes("network error");
        if (isNetworkError) {
          setError("No internet connection. Could not fetch data from NBP API.");
        } else {
          setError("Failed to fetch data: " + err.message);
        }
        setRates1([]);
        setRates2([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currency1, currency2, mode, quarterValue, monthYear, monthNum]);

  const pairLabel = currency1 === currency2
    ? `${currency1}/PLN`
    : `${currency1}/${currency2}`;

  const chartData = useMemo(() => {
    let bins;
    if (currency1 === currency2) {
      if (rates1.length < 2) return [];
      bins = getHistogramDistribution(rates1);
    } else {
      if (rates1.length < 2 || rates2.length < 2) return [];
      bins = getCrossRateHistogram(rates1, rates2);
    }
    if (bins.length === 0) return [];
    return bins.map((b) => ({ label: formatBinLabel(b.min), count: b.count }));
  }, [rates1, rates2, currency1, currency2]);

  return (
    <div className="histogram-panel">
      <h2 className="histogram-title">Monthly and Quarterly Change Distribution</h2>

      <div className="histogram-controls">
        <div className="histogram-currency-selects">
          <div className="histogram-date-picker">
            <label htmlFor="base-currency-select">Base currency</label>
            <CurrencySelect
              id="base-currency-select"
              value={currency1}
              onChange={(e) => {
                const val = e.target.value;
                if (val === currency2) setCurrency2(currency1);
                setCurrency1(val);
              }}
              disabled={loading}
            />
          </div>
          <div className="histogram-date-picker">
            <label htmlFor="quote-currency-select">Quote currency</label>
            <CurrencySelect
              id="quote-currency-select"
              value={currency2}
              onChange={(e) => {
                const val = e.target.value;
                if (val === currency1) setCurrency1(currency2);
                setCurrency2(val);
              }}
              disabled={loading}
            />
          </div>
        </div>

        <div className="histogram-date-picker">
          <label>Calculation period</label>
          <div className="histogram-mode-toggle">
            <button
              className={mode === "monthly" ? "active" : ""}
              onClick={() => setMode("monthly")}
              disabled={loading}
            >
              Monthly
            </button>
            <button
              className={mode === "quarterly" ? "active" : ""}
              onClick={() => setMode("quarterly")}
              disabled={loading}
            >
              Quarterly
            </button>
          </div>
        </div>

        {mode === "quarterly" ? (
          <div className="histogram-date-picker">
            <label>Quarter</label>
            <select
              className="histogram-date-select"
              value={quarterValue}
              onChange={(e) => setQuarterValue(e.target.value)}
              disabled={loading}
            >
              {quarterOptions.map((q) => (
                <option key={q} value={q}>
                  {q.replace("-Q", " Q")}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="histogram-date-picker">
            <label>Month</label>
            <div className="histogram-month-selects">
              <select
                className="histogram-date-select"
                value={monthNum}
                onChange={(e) => setMonthNum(Number(e.target.value))}
                disabled={loading}
              >
                {MONTH_NAMES.map((name, i) => {
                  const mNum = i + 1;
                  if (monthYear === currentYear && mNum >= currentMonth) return null;
                  return <option key={mNum} value={mNum}>{name}</option>;
                })}
              </select>
              <select
                className="histogram-date-select"
                value={monthYear}
                onChange={(e) => setMonthYear(Number(e.target.value))}
                disabled={loading}
              >
                {monthYearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="histogram-loading">
          <div className="spinner">Loading data...</div>
        </div>
      ) : error ? (
        <div className="histogram-error">{error}</div>
      ) : chartData.length === 0 ? (
        <div className="histogram-no-data">No data available for the selected period.</div>
      ) : (
        <div className="histogram-chart-container">
          <Bar
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                title: {
                  display: true,
                  text: pairLabel,
                  color: "#6b6375",
                  font: { size: 12 },
                  padding: { bottom: 8 },
                },
                tooltip: {
                  backgroundColor: "#fff",
                  titleColor: "#08060d",
                  bodyColor: "#08060d",
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
                  },
                },
                y: {
                  grid: { color: "#e5e4e7" },
                  ticks: {
                    color: "#6b6375",
                    font: { size: 12 },
                    precision: 0,
                  },
                },
              },
            }}
            data={{
              labels: chartData.map((d) => d.label),
              datasets: [
                {
                  label: pairLabel,
                  data: chartData.map((d) => d.count),
                  backgroundColor: "#2563eb",
                  barPercentage: 0.9,
                  categoryPercentage: 0.8,
                },
              ],
            }}
          />
        </div>
      )}
    </div>
  );
}
