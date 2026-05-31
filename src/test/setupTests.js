import "@testing-library/jest-dom";
import { jest } from "@jest/globals";

if (!global.fetch) {
  global.fetch = jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ rates: [] }),
    })
  );
}
