import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { InvoiceRiskDonut } from "../../../src/features/reports/InvoiceRiskDonut";
import { MarginCurveSvg } from "../../../src/features/reports/MarginCurveSvg";

describe("Dynamic Visuals: InvoiceRiskDonut & MarginCurveSvg", () => {
  it("InvoiceRiskDonut renders dynamic sequential strokeDasharrays and offsets", () => {
    const { container } = render(
      <InvoiceRiskDonut
        f={{
          revenue: "100000",
          paymentsReceived: "50000",
          outstanding: "30000",
          overdueOutstanding: "20000",
          expenses: "10000",
          estimatedProfit: "90000",
        }}
      />,
    );
    const circles = container.querySelectorAll("svg circle");
    expect(circles.length).toBe(4); // 1 bg circle + 3 colored arc segments
    const emeraldCircle = circles[1];
    const indigoCircle = circles[2];
    const roseCircle = circles[3];

    expect(emeraldCircle.getAttribute("stroke")).toBe("#10b981");
    expect(indigoCircle.getAttribute("stroke")).toBe("#6366f1");
    expect(roseCircle.getAttribute("stroke")).toBe("#f43f5e");

    // 50% collected: colLen ~ 150.8, offset = 0
    expect(Number(emeraldCircle.getAttribute("stroke-dashoffset"))).toBe(0);
    // 30% current outstanding: offset = -colLen ~ -150.8
    expect(Number(indigoCircle.getAttribute("stroke-dashoffset"))).toBeLessThan(
      0,
    );
    // 20% overdue: offset = -(colLen + outLen) ~ -241.28
    expect(Number(roseCircle.getAttribute("stroke-dashoffset"))).toBeLessThan(
      Number(indigoCircle.getAttribute("stroke-dashoffset")),
    );
  });

  it("MarginCurveSvg computes dynamic bezier path based on input net profit", () => {
    const monthsLow = [
      { inv: 100, exp: 90 },
      { inv: 100, exp: 90 },
      { inv: 100, exp: 90 },
      { inv: 100, exp: 90 },
      { inv: 100, exp: 90, isCurrent: true },
    ];
    const { container: cLow } = render(
      <MarginCurveSvg months={monthsLow} fallbackNet={10} />,
    );
    const pathLow =
      cLow.querySelector('path[stroke="#6366f1"]')?.getAttribute("d") || "";

    const monthsHigh = [
      { inv: 1000, exp: 100 },
      { inv: 2000, exp: 100 },
      { inv: 3000, exp: 100 },
      { inv: 4000, exp: 100 },
      { inv: 5000, exp: 100, isCurrent: true },
    ];
    const { container: cHigh } = render(
      <MarginCurveSvg months={monthsHigh} fallbackNet={4900} />,
    );
    const pathHigh =
      cHigh.querySelector('path[stroke="#6366f1"]')?.getAttribute("d") || "";

    expect(pathLow).not.toBe("");
    expect(pathHigh).not.toBe("");
    expect(pathLow).not.toEqual(pathHigh);
    expect(pathHigh).toContain("C ");
  });
});
