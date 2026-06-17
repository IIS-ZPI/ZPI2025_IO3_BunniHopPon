import React from "react";
import "./InsightCard.css";
import { countSessionTrends, calcCoeffOfVariation, calcMinMaxAvg } from "../../core/sessionTrends.js";

export function InsightCard({ data, period, currency }) {
  if (!data || data.length < 2) return null;

  const trends = countSessionTrends(data);
  const cv = calcCoeffOfVariation(data) * 100;
  const mma = calcMinMaxAvg(data);
  
  const startRate = data[0].rate;
  const endRate = data[data.length - 1].rate;
  const overallChange = ((endRate - startRate) / startRate) * 100;

  const getSentiment = () => {
    if (overallChange > 0.5) return { label: "Bullish", class: "up", icon: "📈" };
    if (overallChange < -0.5) return { label: "Bearish", class: "down", icon: "📉" };
    return { label: "Neutral", class: "stable", icon: "📊" };
  };

  const getVolatilityLevel = () => {
    if (cv < 0.5) return "Extremely Low";
    if (cv < 1.5) return "Low";
    if (cv < 3) return "Moderate";
    return "High";
  };

  const sentiment = getSentiment();
  const volLevel = getVolatilityLevel();

  // Find extreme days
  let biggestJump = { change: -Infinity, date: "" };
  let deepestDrop = { change: Infinity, date: "" };

  for (let i = 1; i < data.length; i++) {
    const diff = data[i].rate - data[i - 1].rate;
    if (diff > biggestJump.change) biggestJump = { change: diff, date: data[i].date };
    if (diff < deepestDrop.change) deepestDrop = { change: diff, date: data[i].date };
  }

  return (
    <div className="insight-card">
      <div className="insight-header">
        <span className="insight-icon">{sentiment.icon}</span>
        <div className="insight-title-group">
          <h3>Smart Insights</h3>
          <p>Automated market analysis for {currency}</p>
        </div>
        <div className={`sentiment-badge ${sentiment.class}`}>
          {sentiment.label}
        </div>
      </div>

      <div className="insight-content">
        <div className="insight-summary">
          In the last {period}, {currency} has shown a <strong>{sentiment.label.toLowerCase()}</strong> movement 
          with an overall change of <strong>{overallChange > 0 ? "+" : ""}{overallChange.toFixed(2)}%</strong>.
        </div>

        <div className="insight-grid">
          <div className="insight-item">
            <span className="insight-label">Volatility Status</span>
            <span className={`insight-value vol-${volLevel.toLowerCase().replace(" ", "-")}`}>
              {volLevel} ({cv.toFixed(2)}%)
            </span>
          </div>
          <div className="insight-item">
            <span className="insight-label">Biggest Daily Gain</span>
            <span className="insight-value up">
              +{biggestJump.change.toFixed(4)} <small>({biggestJump.date})</small>
            </span>
          </div>
          <div className="insight-item">
            <span className="insight-label">Deepest Daily Drop</span>
            <span className="insight-value down">
              {deepestDrop.change.toFixed(4)} <small>({deepestDrop.date})</small>
            </span>
          </div>
          <div className="insight-item">
            <span className="insight-label">Session Split</span>
            <span className="insight-value">
              {trends.rising}↑ / {trends.falling}↓ / {trends.unchanged}—
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
