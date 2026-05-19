export function normalizeNbpResponse(nbpResponse) {
  if (!nbpResponse || !nbpResponse.rates || nbpResponse.rates.length === 0) {
    throw new Error("Invalid NBP response: missing or empty rates.");
  }

  return nbpResponse.rates.map((r) => ({
    date: r.effectiveDate,
    rate: r.mid,
  }));
}

export async function fetchNbpRates(code, startDate, endDate, fetchFn = fetch) {
  const url = `https://api.nbp.pl/api/exchangerates/rates/A/${code}/${startDate}/${endDate}/?format=json`;

  const response = await fetchFn(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`NBP API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return normalizeNbpResponse(data);
}

export function countSessionTrends(points) {
  const result = {
    rising: 0,
    falling: 0,
    unchanged: 0,
  };

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1].rate;
    const curr = points[i].rate;

    if (curr > prev) {
      result.rising++;
    } else if (curr < prev) {
      result.falling++;
    } else {
      result.unchanged++;
    }
  }

  return result;
}

export function calcMedian() { }

export function calcMode() { }

export function calcStdDev() { }

export function calcCoeffOfVariation() { }

export function calcMinMaxAvg() { }