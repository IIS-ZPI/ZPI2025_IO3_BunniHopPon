import { describe, it, expect, jest } from "@jest/globals";
import {
  countSessionTrends,
  calcMedian,
  calcMode,
  calcStdDev,
  calcCoeffOfVariation,
  calcMinMaxAvg
} from "../../core/sessionTrends.js";
import {
  normalizeNbpResponse,
  fetchNbpRates,
  chunkDateRange
} from "../../core/nbpService.js";

describe("normalizeNbpResponse", () => {
  it("maps NBP response into date/rate points", () => {
    const nbpResponse = {
      table: "A",
      code: "USD",
      rates: [
        { effectiveDate: "2024-01-02", mid: 4.0 },
        { effectiveDate: "2024-01-03", mid: 4.1 }
      ]
    };

    expect(normalizeNbpResponse(nbpResponse)).toEqual([
      { date: "2024-01-02", rate: 4.0 },
      { date: "2024-01-03", rate: 4.1 }
    ]);
  });

  it("throws on missing or empty rates", () => {
    expect(() => normalizeNbpResponse({ rates: [] })).toThrow();
    expect(() => normalizeNbpResponse({})).toThrow();
  });
});

describe("fetchNbpRates", () => {
  it("fetches and returns normalized points", async () => {
    const nbpResponse = {
      table: "A",
      code: "USD",
      rates: [
        { effectiveDate: "2024-01-02", mid: 4.0 },
        { effectiveDate: "2024-01-03", mid: 4.1 }
      ]
    };

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => nbpResponse
    });

    const result = await fetchNbpRates(
      "USD",
      "2024-01-02",
      "2024-01-03",
      fetchMock
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.nbp.pl/api/exchangerates/rates/A/USD/2024-01-02/2024-01-03/?format=json",
      { headers: { Accept: "application/json" } }
    );

    expect(result).toEqual([
      { date: "2024-01-02", rate: 4.0 },
      { date: "2024-01-03", rate: 4.1 }
    ]);
  });

  it("throws a readable error for non-OK response", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found"
    });

    await expect(
      fetchNbpRates("USD", "2024-01-02", "2024-01-03", fetchMock)
    ).rejects.toThrow("NBP API error: 404 Not Found");
  });
});

describe("countSessionTrends", () => {
  it("counts rising, falling, and unchanged sessions", () => {
    const points = [
      { date: "2024-01-02", rate: 4.0 },
      { date: "2024-01-03", rate: 4.1 },
      { date: "2024-01-04", rate: 4.1 },
      { date: "2024-01-05", rate: 3.9 }
    ];

    expect(countSessionTrends(points)).toEqual({
      rising: 1,
      falling: 1,
      unchanged: 1
    });
  });

  it("returns zeros for empty or single-point input", () => {
    expect(countSessionTrends([])).toEqual({
      rising: 0,
      falling: 0,
      unchanged: 0
    });

    expect(
      countSessionTrends([{ date: "2024-01-02", rate: 4.0 }])
    ).toEqual({ rising: 0, falling: 0, unchanged: 0 });
  });
});

describe("calcMedian", () => {
  it("calculates median for odd count", () => {
    const points = [
      { date: "d1", rate: 1 },
      { date: "d2", rate: 3 },
      { date: "d3", rate: 2 }
    ];
    expect(calcMedian(points)).toBe(2);
  });

  it("calculates median for even count", () => {
    const points = [
      { date: "d1", rate: 1 },
      { date: "d2", rate: 2 },
      { date: "d3", rate: 3 },
      { date: "d4", rate: 4 }
    ];
    expect(calcMedian(points)).toBe(2.5);
  });

  it("throws on empty input", () => {
    expect(() => calcMedian([])).toThrow();
  });
});

describe("calcMode", () => {
  it("returns the most frequent value", () => {
    const points = [
      { date: "d1", rate: 4.0 },
      { date: "d2", rate: 4.1 },
      { date: "d3", rate: 4.1 },
      { date: "d4", rate: 3.9 }
    ];
    expect(calcMode(points)).toBe(4.1);
  });

  it("returns null when there are no repeats", () => {
    const points = [
      { date: "d1", rate: 1 },
      { date: "d2", rate: 2 },
      { date: "d3", rate: 3 }
    ];
    expect(calcMode(points)).toBeNull();
  });

  it("throws on empty input", () => {
    expect(() => calcMode([])).toThrow();
  });
});

describe("calcStdDev (population)", () => {
  it("calculates population standard deviation", () => {
    const points = [
      { date: "d1", rate: 2 },
      { date: "d2", rate: 4 },
      { date: "d3", rate: 4 },
      { date: "d4", rate: 4 },
      { date: "d5", rate: 5 },
      { date: "d6", rate: 5 },
      { date: "d7", rate: 7 },
      { date: "d8", rate: 9 }
    ];
    expect(calcStdDev(points)).toBe(2);
  });

  it("throws on empty input", () => {
    expect(() => calcStdDev([])).toThrow();
  });
});

describe("calcCoeffOfVariation", () => {
  it("returns stddev / mean", () => {
    const points = [
      { date: "d1", rate: 2 },
      { date: "d2", rate: 4 },
      { date: "d3", rate: 4 },
      { date: "d4", rate: 4 },
      { date: "d5", rate: 5 },
      { date: "d6", rate: 5 },
      { date: "d7", rate: 7 },
      { date: "d8", rate: 9 }
    ];
    expect(calcCoeffOfVariation(points)).toBe(0.4);
  });

  it("returns null when mean is 0", () => {
    const points = [
      { date: "d1", rate: 0 },
      { date: "d2", rate: 0 }
    ];
    expect(calcCoeffOfVariation(points)).toBeNull();
  });

  it("throws on empty input", () => {
    expect(() => calcCoeffOfVariation([])).toThrow();
  });
});

describe("calcMinMaxAvg", () => {
  it("returns min, max, avg", () => {
    const points = [
      { date: "d1", rate: 1 },
      { date: "d2", rate: 3 },
      { date: "d3", rate: 2 }
    ];
    expect(calcMinMaxAvg(points)).toEqual({
      min: 1,
      max: 3,
      avg: 2
    });
  });

  it("throws on empty input", () => {
    expect(() => calcMinMaxAvg([])).toThrow();
  });
});

describe("calcMedian edge cases", () => {
  it("handles decimal precision", () => {
    const points = [
      { date: "d1", rate: 0.1 },
      { date: "d2", rate: 0.2 },
      { date: "d3", rate: 0.3 }
    ];
    expect(calcMedian(points)).toBeCloseTo(0.2, 10);
  });

  it("throws on negative rates", () => {
    const points = [
      { date: "d1", rate: -1 },
      { date: "d2", rate: 2 }
    ];
    expect(() => calcMedian(points)).toThrow();
  });

  it("throws on NaN/Infinity", () => {
    expect(() =>
      calcMedian([{ date: "d1", rate: Number.NaN }])
    ).toThrow();
    expect(() =>
      calcMedian([{ date: "d1", rate: Infinity }])
    ).toThrow();
  });
});

describe("calcMode edge cases", () => {
  it("throws on negative rates", () => {
    const points = [
      { date: "d1", rate: -1 },
      { date: "d2", rate: 2 }
    ];
    expect(() => calcMode(points)).toThrow();
  });

  it("throws on NaN/Infinity", () => {
    expect(() =>
      calcMode([{ date: "d1", rate: Number.NaN }])
    ).toThrow();
    expect(() =>
      calcMode([{ date: "d1", rate: Infinity }])
    ).toThrow();
  });
});

describe("calcStdDev edge cases", () => {
  it("handles decimal precision", () => {
    const points = [
      { date: "d1", rate: 1 },
      { date: "d2", rate: 2 }
    ];
    expect(calcStdDev(points)).toBeCloseTo(0.5, 10);
  });

  it("throws on negative rates", () => {
    const points = [
      { date: "d1", rate: -1 },
      { date: "d2", rate: 2 }
    ];
    expect(() => calcStdDev(points)).toThrow();
  });

  it("throws on NaN/Infinity", () => {
    expect(() =>
      calcStdDev([{ date: "d1", rate: Number.NaN }])
    ).toThrow();
    expect(() =>
      calcStdDev([{ date: "d1", rate: Infinity }])
    ).toThrow();
  });
});

describe("calcCoeffOfVariation edge cases", () => {
  it("handles decimal precision", () => {
    const points = [
      { date: "d1", rate: 1 },
      { date: "d2", rate: 2 }
    ];
    expect(calcCoeffOfVariation(points)).toBeCloseTo(1 / 3, 10);
  });

  it("throws on negative rates", () => {
    const points = [
      { date: "d1", rate: -1 },
      { date: "d2", rate: 2 }
    ];
    expect(() => calcCoeffOfVariation(points)).toThrow();
  });

  it("throws on NaN/Infinity", () => {
    expect(() =>
      calcCoeffOfVariation([{ date: "d1", rate: Number.NaN }])
    ).toThrow();
    expect(() =>
      calcCoeffOfVariation([{ date: "d1", rate: Infinity }])
    ).toThrow();
  });
});

describe("calcMinMaxAvg edge cases", () => {
  it("handles decimal precision", () => {
    const points = [
      { date: "d1", rate: 0.1 },
      { date: "d2", rate: 0.2 },
      { date: "d3", rate: 0.4 }
    ];
    const result = calcMinMaxAvg(points);
    expect(result.min).toBe(0.1);
    expect(result.max).toBe(0.4);
    expect(result.avg).toBeCloseTo(0.2333333333, 10);
  });

  it("throws on negative rates", () => {
    const points = [
      { date: "d1", rate: -1 },
      { date: "d2", rate: 2 }
    ];
    expect(() => calcMinMaxAvg(points)).toThrow();
  });

  it("throws on NaN/Infinity", () => {
    expect(() =>
      calcMinMaxAvg([{ date: "d1", rate: Number.NaN }])
    ).toThrow();
    expect(() =>
      calcMinMaxAvg([{ date: "d1", rate: Infinity }])
    ).toThrow();
  });
});

describe("chunkDateRange", () => {
  it("splits a date range into chunks of maximum 93 days", () => {
    const chunks = chunkDateRange("2024-01-01", "2024-05-01", 93);
    expect(chunks.length).toBe(2);
    expect(chunks[0].start).toBe("2024-01-01");
    expect(chunks[0].end).toBe("2024-04-02");
    expect(chunks[1].start).toBe("2024-04-03");
    expect(chunks[1].end).toBe("2024-05-01");
  });

  it("returns a single chunk if the range is shorter than maxDays", () => {
    const chunks = chunkDateRange("2024-01-01", "2024-01-10", 93);
    expect(chunks.length).toBe(1);
    expect(chunks[0].start).toBe("2024-01-01");
    expect(chunks[0].end).toBe("2024-01-10");
  });
});

describe("fetchNbpRates with chunking", () => {
  it("makes multiple fetch requests for ranges longer than 93 days and merges results", async () => {
    const chunk1Response = {
      table: "A",
      code: "USD",
      rates: [{ effectiveDate: "2024-01-02", mid: 4.0 }]
    };
    const chunk2Response = {
      table: "A",
      code: "USD",
      rates: [{ effectiveDate: "2024-04-05", mid: 4.1 }]
    };

    const fetchMock = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => chunk1Response
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => chunk2Response
      });

    const result = await fetchNbpRates(
      "USD",
      "2024-01-01",
      "2024-05-01",
      fetchMock
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result).toEqual([
      { date: "2024-01-02", rate: 4.0 },
      { date: "2024-04-05", rate: 4.1 }
    ]);
  });
});