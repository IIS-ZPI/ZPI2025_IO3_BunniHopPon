import { useState, useEffect, useMemo } from "react";
import "./histogramPanel.css";
import { fetchNbpRates } from "../../core/sessionTrends.js";
import { getHistogramDistribution } from "../../core/histogramDistribution.js";
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

function buildChartData(bins1, bins2) {
  const map = new Map();
  const addBins = (bins, key) => {
    for (const bin of bins) {
      const label = formatBinLabel(bin.min);
      if (!map.has(bin.min)) map.set(bin.min, { label, count1: 0, count2: 0 });
      map.get(bin.min)[key] = bin.count;
    }
  };
  addBins(bins1, "count1");
  addBins(bins2, "count2");
  return [...map.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, v]) => v);
}

export function HistogramPanel() {
  const [mode, setMode] = useState("quarterly");
  const [currency1, setCurrency1] = useState("USD");
  const [currency2, setCurrency2] = useState("EUR");
  const [quarterValue, setQuarterValue] = useState("2024-Q3");
  const [monthYear, setMonthYear] = useState(2024);
  const [monthNum, setMonthNum] = useState(9);
  const [rates1, setRates1] = useState([]);
  const [rates2, setRates2] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const quarterOptions = useMemo(() => {
    const opts = [];
    for (let y = 2025; y >= 2002; y--) {
      for (let q = 4; q >= 1; q--) {
        opts.push(`${y}-Q${q}`);
      }
    }
    return opts;
  }, []);

  const monthYearOptions = useMemo(() => {
    const opts = [];
    for (let y = 2025; y >= 2002; y--) opts.push(y);
    return opts;
  }, []);

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
        setError("Failed to fetch data: " + err.message);
        setRates1([]);
        setRates2([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currency1, currency2, mode, quarterValue, monthYear, monthNum]);

  const chartData = useMemo(() => {
    const bins1 = rates1.length >= 2 ? getHistogramDistribution(rates1) : [];
    const bins2 = rates2.length >= 2 ? getHistogramDistribution(rates2) : [];
    if (bins1.length === 0 && bins2.length === 0) return [];
    return buildChartData(bins1, bins2);
  }, [rates1, rates2]);

  const showBothCurrencies = currency1 !== currency2 && rates2.length >= 2;

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
              onChange={(e) => setCurrency1(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="histogram-date-picker">
            <label htmlFor="quote-currency-select">Quote currency</label>
            <CurrencySelect
              id="quote-currency-select"
              value={currency2}
              onChange={(e) => setCurrency2(e.target.value)}
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
                {MONTH_NAMES.map((name, i) => (
                  <option key={i + 1} value={i + 1}>{name}</option>
                ))}
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
                legend: {
                  display: showBothCurrencies,
                  position: "top",
                  labels: {
                    color: "#6b6375",
                    font: { size: 12 },
                  },
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
                  label: currency1,
                  data: chartData.map((d) => d.count1),
                  backgroundColor: "#2563eb",
                  barPercentage: 0.9,
                  categoryPercentage: 0.8,
                },
                ...(showBothCurrencies
                  ? [
                      {
                        label: currency2,
                        data: chartData.map((d) => d.count2),
                        backgroundColor: "#93c5fd",
                        barPercentage: 0.9,
                        categoryPercentage: 0.8,
                      },
                    ]
                  : []),
              ],
            }}
          />
        </div>
      )}
    </div>
  );
}
