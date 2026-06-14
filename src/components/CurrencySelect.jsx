export const CURRENCIES = ["USD", "AUD", "CAD", "EUR", "HUF", "CHF", "GBP", "JPY", "CZK", "DKK", "NOK", "SEK"];

export function CurrencySelect({ value, onChange, disabled, id }) {
  return (
    <select id={id} value={value} onChange={onChange} disabled={disabled}>
      {CURRENCIES.map((c) => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>
  );
}
