# NBP Analytics - User Manual

## 1. Getting Started

Access the live application at: [NBP Analytics](https://iis-zpi.github.io/ZPI2025_IO3_BunniHopPon/)

Use the dropdown menu at the top right of the screen to switch between the two main views:
- Session Trends
- Monthly and Quarterly Change Distribution

## 2. Session Trends View

This view displays the exchange rate of a chosen currency over time and analyzes rising, falling, and unchanged sessions.

**How to use:**
1. **Exchange rate**: Select the target currency from the dropdown.
2. **Start date**: Choose a starting date for your analysis. Note: The earliest available date is January 2, 2002.
3. **Time period**: Click a button (1w, 2w, 1m, 1q, 6m, 1y) to define the time span. You cannot select a time period that would extend into the future based on your start date.
4. **View Results**: 
   - A line chart will display the currency's rate over the selected period.
   - Below the chart, you will see the Maximum (Max), Minimum (Min), and Average (Avg) values.
   - The statistics module shows the exact number of sessions where the rate rose, fell, or remained unchanged.

## 3. Monthly and Quarterly Change Distribution (Histogram) View

This view shows the distribution of exchange rate changes over a specific month or quarter. You can compare a currency against PLN or compare two foreign currencies (Cross Rates).

**How to use:**
1. **Base currency**: Select the main currency.
2. **Quote currency**: Select the secondary currency.
3. **Calculation period**: Toggle between "Monthly" or "Quarterly".
4. **Date selection**: Based on the calculation period, select either a specific Quarter and Year, or a specific Month and Year. Note: You can only select dates from 2002 up to the current date; future months or quarters are not available.
5. **View Results**: A bar chart (histogram) will display the distribution of exchange rate changes for the selected period and currency pair.

## 4. Troubleshooting
- **No data available / Network Errors**: Ensure you have an active internet connection. The NBP API might occasionally be unavailable or lack data for weekends and holidays.
- **Loading indicator**: Wait for the "Loading data..." label to disappear before interacting with the controls.
