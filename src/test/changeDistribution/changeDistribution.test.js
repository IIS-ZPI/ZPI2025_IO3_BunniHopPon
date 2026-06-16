import { describe, it, expect, jest } from "@jest/globals";
import { fetchNbpRates } from "../../core/sessionTrends.js";
import { 
    calculateDailyChanges, 
    initializeBins, 
    determineBin, 
    groupChangesIntoBins, 
    getHistogramDistribution 
} from "../../core/histogramDistribution.js";

describe("histogramDistribution module", () => {

    describe("calculateDailyChanges", () => {
        it("throws an error when input is not a valid array", () => {
            expect(() => calculateDailyChanges(null)).toThrow("Insufficient points");
            expect(() => calculateDailyChanges("invalid")).toThrow("Insufficient points");
            expect(() => calculateDailyChanges({})).toThrow("Insufficient points");
        });

        it("throws an error when input array has less than two points", () => {
            expect(() => calculateDailyChanges([{ rate: 4.0 }])).toThrow("Insufficient points");
        });

        it("throws an error on invalid or negative rates", () => {
            expect(() => calculateDailyChanges([{rate: 4.0}, {rate: -4.0}])).toThrow("Invalid rate");
            expect(() => calculateDailyChanges([{rate: 0}, {rate: 4.0}])).toThrow("Invalid rate");
            expect(() => calculateDailyChanges([{rate: 4.0}, {rate: NaN}])).toThrow("Invalid rate");
            expect(() => calculateDailyChanges([{rate: 4.0}, {rate: undefined}])).toThrow("Invalid rate");
        });

        it("calculates percentage changes accurately with JS float protection", () => {
            const points = [
                { rate: 4.0 },
                { rate: 4.02 },
                { rate: 4.0 },
            ];
            const changes = calculateDailyChanges(points);
            expect(changes[0]).toBe(0.5);
            expect(changes[1]).toBe(-0.4975);
        });
    });

    describe("initializeBins", () => {
        it("returns a Map with 13 default bins", () => {
            const bins = initializeBins();
            expect(bins.size).toBe(13);
            expect(bins.has("-3.0_-2.5")).toBe(true);
            expect(bins.has("3.0_3.5")).toBe(true);
            expect(bins.has("-0.0_0.5")).toBe(false);
            expect(bins.has("0.0_0.5")).toBe(true);
        });
    });

    describe("determineBin", () => {
        it("returns correct bin bounds and key for standard changes", () => {
            const bin = determineBin(1.2);
            expect(bin.minBin).toBe(1.0);
            expect(bin.maxBin).toBe(1.5);
            expect(bin.key).toBe("1.0_1.5");
        });

        it("handles exact boundaries properly", () => {
            const bin = determineBin(0.5);
            expect(bin.minBin).toBe(0.5);
            expect(bin.maxBin).toBe(1.0);
            expect(bin.key).toBe("0.5_1.0");
        });

        it("safely handles 0 without -0 string issues", () => {
            const binPositive = determineBin(0.0);
            const binNegative = determineBin(-0.0);
            expect(binPositive.minBin).toBe(0);
            expect(binNegative.minBin).toBe(0);
            expect(binPositive.key).toBe("0.0_0.5");
            expect(binNegative.key).toBe("0.0_0.5");
        });

        it("throws on invalid change values", () => {
            expect(() => determineBin(NaN)).toThrow("Invalid change value");
            expect(() => determineBin("string")).toThrow("Invalid change value");
        });
    });

    describe("groupChangesIntoBins", () => {
        it("assigns changes to pre-existing bins and increments counts", () => {
            const bins = initializeBins();
            const changes = [0.1, 0.4, -1.2, 0.1];
            groupChangesIntoBins(changes, bins);
            
            expect(bins.get("0.0_0.5").count).toBe(3);
            expect(bins.get("-1.5_-1.0").count).toBe(1);
            expect(bins.get("1.0_1.5").count).toBe(0);
        });

        it("dynamically generates new bins if change is out of bounds", () => {
            const bins = initializeBins();
            const changes = [50.2, -50.1];
            groupChangesIntoBins(changes, bins);
            
            expect(bins.get("50.0_50.5").count).toBe(1);
            expect(bins.get("-50.5_-50.0").count).toBe(1);
            expect(bins.size).toBe(15);
        });
    });

    describe("getHistogramDistribution", () => {
        it("integrates all steps correctly to output array sorted by min bin", async () => {
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

            expect(result.length).toBe(13);
            expect(result.find(b => b.min === 1.0 && b.max === 1.5).count).toBe(1);
            expect(result.find(b => b.min === 2.0 && b.max === 2.5).count).toBe(1);
            expect(result.find(b => b.min === -2.0 && b.max === -1.5).count).toBe(1);
            expect(result.find(b => b.min === 0.0 && b.max === 0.5).count).toBe(0);
        });
    });

});
