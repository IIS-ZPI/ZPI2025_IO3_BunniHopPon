export function normalizeNbpResponse(nbpResponse) {
  if (!nbpResponse || !nbpResponse.rates || nbpResponse.rates.length === 0) {
    throw new Error("Invalid NBP response: missing or empty rates.");
  }

  return nbpResponse.rates.map((r) => ({
    date: r.effectiveDate,
    rate: r.mid,
  }));
}

export function fetchNbpRates() { }

export function countSessionTrends() { }

export function calcMedian() { }

export function calcMode() { }

export function calcStdDev() { }

export function calcCoeffOfVariation() { }

export function calcMinMaxAvg() { }