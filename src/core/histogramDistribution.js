export function calculateDailyChanges(points) {
    if (!Array.isArray(points) || points.length < 2) {
        throw new Error("Insufficient points: at least two data points are required to calculate changes.");
    }

    const changes = [];
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]?.rate;
        const curr = points[i]?.rate;

        if (
            typeof prev !== "number" || typeof curr !== "number" ||
            Number.isNaN(prev) || Number.isNaN(curr) ||
            !Number.isFinite(prev) || !Number.isFinite(curr) ||
            prev <= 0 || curr < 0
        ) {
            throw new Error("Invalid rate: rates must be positive finite numbers and previous rate must be strictly greater than zero.");
        }

        const rawChange = ((curr - prev) / prev) * 100;
        const change = Math.round(rawChange * 10000) / 10000;
        changes.push(change);
    }
    return changes;
}

export function initializeBins() {
    const bins = new Map();
    for (let i = -6; i <= 6; i++) {
        let min = i * 0.5;
        let max = (i + 1) * 0.5;

        min = min === 0 ? 0 : min;
        max = max === 0 ? 0 : max;

        bins.set(`${min.toFixed(1)}_${max.toFixed(1)}`, { min, max, count: 0 });
    }
    return bins;
}

export function determineBin(change) {
    if (typeof change !== "number" || Number.isNaN(change) || !Number.isFinite(change)) {
        throw new Error("Invalid change value: must be a finite number.");
    }

    let minBin = Math.floor(change / 0.5) * 0.5;
    let maxBin = minBin + 0.5;

    minBin = minBin === 0 ? 0 : minBin;
    maxBin = maxBin === 0 ? 0 : maxBin;

    const key = `${minBin.toFixed(1)}_${maxBin.toFixed(1)}`;
    return { minBin, maxBin, key };
}

export function groupChangesIntoBins(changes, binsMap) {
    for (const change of changes) {
        const { minBin, maxBin, key } = determineBin(change);
        
        if (!binsMap.has(key)) {
            binsMap.set(key, { min: minBin, max: maxBin, count: 0 });
        }
        binsMap.get(key).count++;
    }
    return binsMap;
}

export function getHistogramDistribution(points) {
    const changes = calculateDailyChanges(points);
    const bins = initializeBins();
    groupChangesIntoBins(changes, bins);
    return Array.from(bins.values()).sort((a, b) => a.min - b.min);
}
