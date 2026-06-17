
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

function extractAndValidateRates(points) {
  if (!points || points.length === 0) {
    throw new Error("Empty input");
  }
  return points.map((p) => {
    const r = p.rate;
    if (typeof r !== "number" || Number.isNaN(r) || !Number.isFinite(r) || r < 0) {
      throw new Error("Invalid rate");
    }
    return r;
  });
}

export function calcMedian(points) {
  const rates = extractAndValidateRates(points);
  rates.sort((a, b) => a - b);

  const mid = Math.floor(rates.length / 2);
  if (rates.length % 2 === 0) {
    return (rates[mid - 1] + rates[mid]) / 2;
  }
  return rates[mid];
}

export function calcMode(points) {
  const rates = extractAndValidateRates(points);
  const counts = new Map();
  let maxCount = 0;
  let mode = null;

  for (const rate of rates) {
    const count = (counts.get(rate) || 0) + 1;
    counts.set(rate, count);
    if (count > maxCount) {
      maxCount = count;
      mode = rate;
    }
  }

  return maxCount > 1 ? mode : null;
}

export function calcStdDev(points) {
  const rates = extractAndValidateRates(points);
  const n = rates.length;
  const mean = rates.reduce((a, b) => a + b, 0) / n;
  const variance = rates.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
  return Math.sqrt(variance);
}

export function calcCoeffOfVariation(points) {
  const rates = extractAndValidateRates(points);

  const avg = rates.reduce((acc, curr) => acc + curr, 0) / rates.length;
  if (avg === 0) return null;

  return calcStdDev(points) / avg;
}

export function calcMinMaxAvg(points) {
  const rates = extractAndValidateRates(points);

  const avg = rates.reduce((acc, curr) => acc + curr, 0) / rates.length;
  const min = Math.min(...rates);
  const max = Math.max(...rates);

  return { min, max, avg };
}