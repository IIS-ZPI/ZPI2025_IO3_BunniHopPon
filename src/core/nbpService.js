export function normalizeNbpResponse(nbpResponse) {
  if (!nbpResponse || !nbpResponse.rates || nbpResponse.rates.length === 0) {
    throw new Error("Invalid NBP response: missing or empty rates.");
  }

  return nbpResponse.rates.map((r) => ({
    date: r.effectiveDate,
    rate: r.mid,
  }));
}

export function chunkDateRange(startStr, endStr, maxDays = 93) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const chunks = [];

  let currentStart = new Date(start);

  while (currentStart <= end) {
    const currentEnd = new Date(currentStart);
    currentEnd.setUTCDate(currentStart.getUTCDate() + maxDays - 1);

    if (currentEnd > end) {
      chunks.push({
        start: currentStart.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0]
      });
      break;
    } else {
      chunks.push({
        start: currentStart.toISOString().split("T")[0],
        end: currentEnd.toISOString().split("T")[0]
      });
    }

    currentStart = new Date(currentEnd);
    currentStart.setUTCDate(currentEnd.getUTCDate() + 1);
  }

  return chunks;
}

export async function fetchNbpRates(code, startDate, endDate, fetchFn = fetch) {
  const chunks = chunkDateRange(startDate, endDate, 93);

  const promises = chunks.map(async (chunk) => {
    const url = `https://api.nbp.pl/api/exchangerates/rates/A/${code}/${chunk.start}/${chunk.end}/?format=json`;

    const response = await fetchFn(url, {
      headers: { Accept: "application/json" },
    });

    if (response.status === 404) {
      if (chunks.length === 1) {
        throw new Error(`NBP API error: ${response.status} ${response.statusText}`);
      }
      return [];
    }

    if (!response.ok) {
      throw new Error(`NBP API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return normalizeNbpResponse(data);
  });

  const results = await Promise.all(promises);
  return results.flat();
}
