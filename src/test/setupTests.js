import "@testing-library/jest-dom";
import { jest } from "@jest/globals";

const g = typeof window !== "undefined" ? window : {};

if (!g.fetch) {
  g.fetch = jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ rates: [] }),
    })
  );
}
