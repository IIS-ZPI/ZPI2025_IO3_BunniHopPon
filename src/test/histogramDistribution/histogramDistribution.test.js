import { describe, it, expect, jest } from "@jest/globals";
import { fetchNbpRates, normalizeNbpResponse } from "../../core/sessionTrends.js";
import { getHistogramDistribution } from "../../core/histogramDistribution.js";

describe("getHistogramDistribution with NBP data simulation", () => {
  it("calculates distribution correctly using fetchNbpRates with mocked API", async () => {
    const nbpResponse = {
      table: "A",
      code: "USD",
      rates: [
        { effectiveDate: "2024-01-01", mid: 4.0 },
        { effectiveDate: "2024-01-02", mid: 4.04 },
        { effectiveDate: "2024-01-03", mid: 4.1208 },
        { effectiveDate: "2024-01-04", mid: 4.038384 }
      ]
    };

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => nbpResponse
    });

    const points = await fetchNbpRates("USD", "2024-01-01", "2024-01-04", fetchMock);

    const result = getHistogramDistribution(points);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.nbp.pl/api/exchangerates/rates/A/USD/2024-01-01/2024-01-04/?format=json",
      { headers: { Accept: "application/json" } }
    );

    expect(result.find(b => b.min === 1.0 && b.max === 1.5).count).toBe(1);
    expect(result.find(b => b.min === 2.0 && b.max === 2.5).count).toBe(1);
    expect(result.find(b => b.min === -2.0 && b.max === -1.5).count).toBe(1);
    
    expect(result.find(b => b.min === 0.0 && b.max === 0.5).count).toBe(0);
  });

  it("handles exact 0.5% boundary change", () => {
    const nbpResponse = {
      table: "A",
      code: "USD",
      rates: [
        { effectiveDate: "2024-01-01", mid: 4.0 },
        { effectiveDate: "2024-01-02", mid: 4.02 }
      ]
    };
    
    const points = normalizeNbpResponse(nbpResponse);
    const result = getHistogramDistribution(points);

    expect(result.find(b => b.min === 0.5 && b.max === 1.0).count).toBe(1);
  });

  it("handles identical rates (0.0% change) correctly without creating duplicate -0.0 bins", () => {
    const nbpResponse = {
      table: "A",
      code: "USD",
      rates: [
        { effectiveDate: "2024-01-01", mid: 4.0 },
        { effectiveDate: "2024-01-02", mid: 4.0 }
      ]
    };
    const points = normalizeNbpResponse(nbpResponse);
    const result = getHistogramDistribution(points);

    expect(result.find(b => b.min === 0.0 && b.max === 0.5).count).toBe(1);
    expect(result.filter(b => b.min === 0).length).toBe(1); // Ensure no "-0.0" duplicate
    expect(result.length).toBe(13); // Default 13 bins
  });

  it("handles negative rate values from API simulation by throwing an error", () => {
    const nbpResponse = {
      table: "A",
      code: "USD",
      rates: [
        { effectiveDate: "2024-01-01", mid: 4.0 },
        { effectiveDate: "2024-01-02", mid: -4.0 }
      ]
    };
    
    const points = normalizeNbpResponse(nbpResponse);
    expect(() => getHistogramDistribution(points)).toThrow("Invalid rate");
  });

  it("throws an error if previous rate is 0 to avoid division by zero", () => {
    const nbpResponse = {
      table: "A",
      code: "USD",
      rates: [
        { effectiveDate: "2024-01-01", mid: 0.0 },
        { effectiveDate: "2024-01-02", mid: 4.0 }
      ]
    };
    const points = normalizeNbpResponse(nbpResponse);
    expect(() => getHistogramDistribution(points)).toThrow("Invalid rate");
  });

  it("throws an error when NBP response results in only one data point", () => {
    const nbpResponse = {
      table: "A",
      code: "USD",
      rates: [
        { effectiveDate: "2024-01-01", mid: 4.0 }
      ]
    };
    
    const points = normalizeNbpResponse(nbpResponse);
    expect(() => getHistogramDistribution(points)).toThrow("Insufficient points");
  });

  it("throws an error when input is not a valid array", () => {
    expect(() => getHistogramDistribution(null)).toThrow("Insufficient points");
    expect(() => getHistogramDistribution("invalid")).toThrow("Insufficient points");
    expect(() => getHistogramDistribution({})).toThrow("Insufficient points");
  });

  it("dynamically generates bins for extreme positive changes", async () => {
    const nbpResponse = {
      table: "A",
      code: "USD",
      rates: [
        { effectiveDate: "2024-01-01", mid: 4.0 },
        { effectiveDate: "2024-01-02", mid: 6.0 }
      ]
    };

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => nbpResponse
    });

    const points = await fetchNbpRates("USD", "2024-01-01", "2024-01-02", fetchMock);
    const result = getHistogramDistribution(points);

    expect(result.find(b => b.min === 50.0 && b.max === 50.5).count).toBe(1);
  });

  it("dynamically generates bins for extreme negative changes", () => {
    const nbpResponse = {
      table: "A",
      code: "USD",
      rates: [
        { effectiveDate: "2024-01-01", mid: 8.0 },
        { effectiveDate: "2024-01-02", mid: 4.0 } // -50.0%
      ]
    };

    const points = normalizeNbpResponse(nbpResponse);
    const result = getHistogramDistribution(points);

    expect(result.find(b => b.min === -50.0 && b.max === -49.5).count).toBe(1);
  });
});
