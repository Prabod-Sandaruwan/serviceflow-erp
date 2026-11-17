import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ExecutiveKpis } from "../../../src/features/reports/ExecutiveKpis";

describe("ExecutiveKpis Dynamic Badges", () => {
  it("renders dynamic computed rates, margins and badges when data is present", () => {
    render(
      <ExecutiveKpis
        f={{
          revenue: "100000.00",
          paymentsReceived: "80000.00",
          outstanding: "20000.00",
          overdueOutstanding: "5000.00",
          overdueCount: 3,
          expenses: "25000.00",
          estimatedProfit: "75000.00",
        }}
      />,
    );

    expect(screen.getByText("Active billing")).toBeInTheDocument();
    expect(screen.getByText("80% Rate")).toBeInTheDocument();
    expect(screen.getByText("3 Overdue")).toBeInTheDocument();
    expect(screen.getByText("● Attention")).toBeInTheDocument();
    expect(screen.getByText("75.0% Margin")).toBeInTheDocument();
  });

  it("renders zero / clear fallback badges when balances are zero", () => {
    render(
      <ExecutiveKpis
        f={{
          revenue: "0.00",
          paymentsReceived: "0.00",
          outstanding: "0.00",
          overdueOutstanding: "0.00",
          overdueCount: 0,
          expenses: "0.00",
          estimatedProfit: "0.00",
        }}
      />,
    );

    expect(screen.getByText("No volume")).toBeInTheDocument();
    expect(screen.getByText("0% Rate")).toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();
    expect(screen.getByText("● Clear")).toBeInTheDocument();
    expect(screen.getByText("0.0% Margin")).toBeInTheDocument();
  });
});
