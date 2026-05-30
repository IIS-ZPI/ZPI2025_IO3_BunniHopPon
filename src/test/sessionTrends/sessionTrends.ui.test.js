import { describe, it, expect } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import SessionTrendsPanel from "../../features/sessionTrends/sessionTrendsPanel.js";

describe("Session trends UI", () => {
	it("renders core controls", () => {
		render(React.createElement(SessionTrendsPanel));

		expect(screen.getByLabelText(/exchange rate/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();

		expect(screen.getByRole("button", { name: /1w/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /2w/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /1m/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /1q/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /6m/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /1y/i })).toBeInTheDocument();
	});

	it("does not expose extra analysis periods", () => {
		render(React.createElement(SessionTrendsPanel));

		expect(screen.queryByRole("button", { name: /3m/i })).toBeNull();
		expect(screen.queryByRole("button", { name: /2y/i })).toBeNull();
	});

	it("renders fixed statistics badges", () => {
		render(React.createElement(SessionTrendsPanel));

		expect(screen.getByText(/median/i)).toBeInTheDocument();
		expect(screen.getByText(/mode/i)).toBeInTheDocument();
		expect(screen.getByText(/standard deviation/i)).toBeInTheDocument();
		expect(screen.getByText(/coefficient of variation/i)).toBeInTheDocument();
		expect(screen.getByText(/increasing/i)).toBeInTheDocument();
		expect(screen.getByText(/decreasing/i)).toBeInTheDocument();
		expect(screen.getByText(/no change/i)).toBeInTheDocument();
	});

	it("renders max/min/avg labels", () => {
		render(React.createElement(SessionTrendsPanel));

		expect(screen.getByText(/max/i)).toBeInTheDocument();
		expect(screen.getByText(/min/i)).toBeInTheDocument();
		expect(screen.getByText(/avg/i)).toBeInTheDocument();
	});
    
	it("uses a bounded start date", () => {
		render(React.createElement(SessionTrendsPanel));

		const startDate = screen.getByLabelText(/start date/i);
		expect(startDate).toHaveAttribute("min", "2002-01-02");
	});

	it("renders a session trends chart container", () => {
		render(React.createElement(SessionTrendsPanel));

		expect(screen.getByTestId("session-trends-chart")).toBeInTheDocument();
	});

	it("shows a predefined list of currencies", () => {
		render(React.createElement(SessionTrendsPanel));

		const select = screen.getByLabelText(/exchange rate/i);
		const options = Array.from(select.querySelectorAll("option")).map(
			(option) => option.textContent
		);
		const trimmed = options
			.map((value) => (value ? value.trim() : ""))
			.filter((value) => value.length > 0);

		expect(trimmed.length).toBeGreaterThan(0);
	});

	it("disables controls and shows spinner during loading", () => {
		render(React.createElement(SessionTrendsPanel, { isLoading: true }));

		expect(screen.getByTestId("session-trends-spinner")).toBeInTheDocument();
		expect(screen.getByLabelText(/exchange rate/i)).toBeDisabled();
		expect(screen.getByLabelText(/start date/i)).toBeDisabled();
		expect(screen.getByRole("button", { name: /1w/i })).toBeDisabled();
	});

	it("prevents manual currency input", async () => {
		const user = userEvent.setup();
		render(React.createElement(SessionTrendsPanel));

		const select = screen.getByLabelText(/exchange rate/i);
		await user.type(select, "ABC");
		expect(select).not.toHaveDisplayValue("ABC");
	});
});
