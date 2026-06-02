import { describe, it, expect } from "@jest/globals";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import ChangeDistributionPanel from "../../features/changeDistribution/changeDistributionPanel.js";

describe("Change distribution UI", () => {
	it("renders core controls for monthly and quarterly analysis", () => {
		render(React.createElement(ChangeDistributionPanel));

		expect(
			screen.getByRole("heading", {
				name: /monthly and quarterly change distribution/i,
			})
		).toBeInTheDocument();

		expect(screen.getByLabelText(/base currency/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/quote currency/i)).toBeInTheDocument();

		expect(screen.getByRole("button", { name: /^monthly$/i })).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /^quarterly$/i })
		).toBeInTheDocument();

		expect(screen.getByLabelText(/calculation period/i)).toBeInTheDocument();
	});

	it("restricts view mode to monthly and quarterly only", () => {
		render(React.createElement(ChangeDistributionPanel));

		expect(screen.queryByRole("button", { name: /weekly/i })).toBeNull();
		expect(screen.queryByRole("button", { name: /daily/i })).toBeNull();
		expect(screen.queryByRole("button", { name: /yearly/i })).toBeNull();
		expect(screen.queryByRole("button", { name: /custom/i })).toBeNull();
	});

	it("shows quarter period label in quarterly mode", () => {
		render(
			React.createElement(ChangeDistributionPanel, { viewMode: "quarterly" })
		);

		expect(screen.getByTestId("period-type-label")).toHaveTextContent(
			/^quarter$/i
		);
	});

	it("shows month period label in monthly mode", async () => {
		const user = userEvent.setup();
		render(React.createElement(ChangeDistributionPanel));

		await user.click(screen.getByRole("button", { name: /^monthly$/i }));

		expect(screen.getByTestId("period-type-label")).toHaveTextContent(/^month$/i);
	});

	it("offers predefined calendar quarters in quarterly mode", () => {
		render(
			React.createElement(ChangeDistributionPanel, { viewMode: "quarterly" })
		);

		const periodSelect = screen.getByLabelText(/calculation period/i);
		const options = Array.from(periodSelect.querySelectorAll("option"))
			.map((option) => option.textContent?.trim() ?? "")
			.filter((value) => value.length > 0);

		expect(options.length).toBeGreaterThan(0);
		expect(options.every((label) => /Q[1-4]/.test(label))).toBe(true);
		expect(options.some((label) => /–|—|to/i.test(label))).toBe(false);
	});

	it("offers predefined calendar months in monthly mode", async () => {
		const user = userEvent.setup();
		render(React.createElement(ChangeDistributionPanel));

		await user.click(screen.getByRole("button", { name: /^monthly$/i }));

		const periodSelect = screen.getByLabelText(/calculation period/i);
		const options = Array.from(periodSelect.querySelectorAll("option"))
			.map((option) => option.textContent?.trim() ?? "")
			.filter((value) => value.length > 0);

		expect(options.length).toBeGreaterThan(0);
		expect(
			options.every((label) =>
				/^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$/.test(
					label
				)
			)
		).toBe(true);
	});

	it("does not expose custom date range inputs", () => {
		render(React.createElement(ChangeDistributionPanel));

		expect(screen.queryByLabelText(/start date/i)).toBeNull();
		expect(screen.queryByLabelText(/end date/i)).toBeNull();
		expect(screen.queryByLabelText(/date range/i)).toBeNull();
		expect(screen.queryByLabelText(/from/i)).toBeNull();
		expect(screen.queryByLabelText(/to/i)).toBeNull();
	});

	it("shows a predefined list of currencies for both selectors", () => {
		render(React.createElement(ChangeDistributionPanel));

		for (const label of [/base currency/i, /quote currency/i]) {
			const select = screen.getByLabelText(label);
			const options = Array.from(select.querySelectorAll("option"))
				.map((option) => option.textContent?.trim() ?? "")
				.filter((value) => value.length > 0);

			expect(options.length).toBeGreaterThan(0);
		}
	});

	it("prevents manual currency input", async () => {
		const user = userEvent.setup();
		render(React.createElement(ChangeDistributionPanel));

		for (const label of [/base currency/i, /quote currency/i]) {
			const select = screen.getByLabelText(label);
			await user.type(select, "XYZ");
			expect(select).not.toHaveDisplayValue("XYZ");
		}
	});

	it("prevents selecting the same currency in both inputs", async () => {
		const user = userEvent.setup();
		render(React.createElement(ChangeDistributionPanel));

		const baseCurrency = screen.getByLabelText(/base currency/i);
		const quoteCurrency = screen.getByLabelText(/quote currency/i);

		const sharedCode = "USD";
		await user.selectOptions(baseCurrency, sharedCode);
		await user.selectOptions(quoteCurrency, sharedCode);

		expect(baseCurrency).toHaveValue(sharedCode);
		expect(quoteCurrency).not.toHaveValue(sharedCode);
	});

	it("renders a change distribution histogram container", () => {
		render(React.createElement(ChangeDistributionPanel));

		expect(screen.getByTestId("change-distribution-chart")).toBeInTheDocument();
	});

	it("does not expose chart export or data download actions", () => {
		render(React.createElement(ChangeDistributionPanel));

		expect(
			screen.queryByRole("button", { name: /export|download|save as/i })
		).toBeNull();
	});

	it("does not expose zoom, pan, or axis scaling controls", () => {
		render(React.createElement(ChangeDistributionPanel));

		expect(screen.queryByRole("button", { name: /zoom|pan|scale/i })).toBeNull();
		expect(screen.queryByLabelText(/y-axis min/i)).toBeNull();
		expect(screen.queryByLabelText(/y-axis max/i)).toBeNull();
		expect(screen.queryByLabelText(/axis minimum/i)).toBeNull();
		expect(screen.queryByLabelText(/axis maximum/i)).toBeNull();
	});

	it("does not expose theme customization", () => {
		render(React.createElement(ChangeDistributionPanel));

		expect(screen.queryByRole("button", { name: /dark mode|theme/i })).toBeNull();
	});

	it("disables controls and shows spinner during loading", () => {
		render(React.createElement(ChangeDistributionPanel, { isLoading: true }));

		expect(screen.getByTestId("change-distribution-spinner")).toBeInTheDocument();
		expect(screen.queryByTestId("change-distribution-chart")).toBeNull();

		expect(screen.getByLabelText(/base currency/i)).toBeDisabled();
		expect(screen.getByLabelText(/quote currency/i)).toBeDisabled();
		expect(screen.getByLabelText(/calculation period/i)).toBeDisabled();
		expect(screen.getByRole("button", { name: /^monthly$/i })).toBeDisabled();
		expect(screen.getByRole("button", { name: /^quarterly$/i })).toBeDisabled();
	});

	it("shows histogram tooltip with only range and frequency", async () => {
		const user = userEvent.setup();
		render(
			React.createElement(ChangeDistributionPanel, {
				histogramBars: [
					{
						rangeLabel: "0.0% to +0.5%",
						frequency: 38,
						testId: "histogram-bar-0",
					},
				],
			})
		);

		await user.hover(screen.getByTestId("histogram-bar-0"));

		const tooltip = await screen.findByRole("tooltip");
		const tooltipText = tooltip.textContent ?? "";

		expect(tooltipText).toMatch(/0\.0%/);
		expect(tooltipText).toMatch(/38/);
		expect(tooltipText).not.toMatch(/median|mode|std dev|average|mean/i);
	});

	it("keeps chart interaction region free of zoom handlers", () => {
		render(React.createElement(ChangeDistributionPanel));

		const chart = screen.getByTestId("change-distribution-chart");
		expect(chart).not.toHaveAttribute("data-zoom-enabled", "true");
		expect(within(chart).queryByRole("button")).toBeNull();
	});
});
