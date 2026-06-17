import { useState } from "react";
import "./App.css";
import { SessionTrendsPanel } from "./features/sessionTrends/sessionTrendsPanel.jsx";
import { HistogramPanel } from "./features/histogram/histogramPanel.jsx";
import logo from "./assets/logo.jpg";

const PAGES = [
  { id: "trends", label: "Session Trends" },
  { id: "histogram", label: "Monthly and Quarterly Change Distribution" },
];

function App() {
  const [page, setPage] = useState("trends");
  const [isAppLoading, setIsAppLoading] = useState(false);

  return (
    <div className="App">
      <header
        style={{
          padding: "32px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <img
            src={logo}
            alt="Logo"
            style={{ height: "40px", width: "auto" }}
          />
          <h1 style={{ margin: 0, color: "var(--text-h)", fontSize: "40px" }}>
            NBP Analytics
          </h1>
        </div>
        <select
          value={page}
          onChange={(e) => setPage(e.target.value)}
          disabled={isAppLoading}
          style={{
            padding: "10px 14px",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            background: "var(--bg)",
            color: "var(--text-h)",
            fontFamily: "var(--sans)",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            outline: "none",
            minWidth: "280px",
            opacity: isAppLoading ? 0.5 : 1,
          }}
        >
          {PAGES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </header>
      <main
        style={{ background: "var(--bg)", minHeight: "80vh", width: "100%" }}
      >
        {page === "trends" ? (
          <SessionTrendsPanel onLoadingChange={setIsAppLoading} />
        ) : (
          <HistogramPanel onLoadingChange={setIsAppLoading} />
        )}
      </main>
      <div className="ticks"></div>
      <section id="spacer"></section>
    </div>
  );
}

export default App;
