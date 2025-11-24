import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TotalCard from "@/components/Dashboard/TotalCard";
import ComparisonStat from "@/components/Dashboard/ComparisonStat";
import TopContributor from "@/components/Dashboard/TopContributor";

/**
 * BOUNDARY VALUE TESTING
 * Tests edge cases and boundary conditions that could cause issues
 */

describe("Boundary Testing - TotalCard Component", () => {
  it("handles zero emissions", () => {
    const mockSummary = { totalEmissions: 0 };
    render(<TotalCard summary={mockSummary} />);
    expect(screen.getByText("0.0")).toBeInTheDocument();
  });

  it("handles very large emissions (max safe integer)", () => {
    const mockSummary = { totalEmissions: Number.MAX_SAFE_INTEGER };
    render(<TotalCard summary={mockSummary} />);
    // Should render without crashing
    expect(screen.getByText("gCO₂")).toBeInTheDocument();
  });

  it("handles negative emissions (invalid but defensive)", () => {
    const mockSummary = { totalEmissions: -100 };
    render(<TotalCard summary={mockSummary} />);
    expect(screen.getByText("-100.0")).toBeInTheDocument();
  });

  it("handles floating point precision issues", () => {
    const mockSummary = { totalEmissions: 0.1 + 0.2 }; // = 0.30000000000000004
    render(<TotalCard summary={mockSummary} />);
    expect(screen.getByText("0.3")).toBeInTheDocument(); // toFixed(1) handles this
  });

  it("handles undefined totalEmissions gracefully", () => {
    const mockSummary = { totalEmissions: undefined };
    render(<TotalCard summary={mockSummary} />);
    expect(screen.getByText("0.0")).toBeInTheDocument();
  });

  it("handles null totalEmissions gracefully", () => {
    const mockSummary = { totalEmissions: null };
    render(<TotalCard summary={mockSummary} />);
    expect(screen.getByText("0.0")).toBeInTheDocument();
  });

  it("handles NaN emissions gracefully", () => {
    const mockSummary = { totalEmissions: NaN };
    render(<TotalCard summary={mockSummary} />);
    expect(screen.getByText("NaN")).toBeInTheDocument();
  });

  it("handles Infinity emissions", () => {
    const mockSummary = { totalEmissions: Infinity };
    render(<TotalCard summary={mockSummary} />);
    expect(screen.getByText("Infinity")).toBeInTheDocument();
  });
});

describe("Boundary Testing - ComparisonStat Component", () => {
  it("handles equal home and global averages", () => {
    const mockComparison = { homeAvg: 100, globalAvg: 100 };
    render(<ComparisonStat comparison={mockComparison} />);
    // When equal, isBetter = false (100 < 100 is false), shows "Higher"
    expect(screen.getByText(/0\.0% Higher/)).toBeInTheDocument();
    expect(screen.getByText("Catch Up")).toBeInTheDocument();
  });

  it("handles zero global average (division by zero)", () => {
    const mockComparison = { homeAvg: 50, globalAvg: 0 };
    render(<ComparisonStat comparison={mockComparison} />);
    // Should render without crashing, percentage will be 0
    // Global average shows as 0 g
    const zeroElements = screen.getAllByText(/0 g/);
    expect(zeroElements.length).toBeGreaterThan(0);
  });

  it("handles both values as zero", () => {
    const mockComparison = { homeAvg: 0, globalAvg: 0 };
    render(<ComparisonStat comparison={mockComparison} />);
    // Both home and global show 0 g (appears twice)
    const zeroElements = screen.getAllByText(/0 g/);
    expect(zeroElements.length).toBeGreaterThanOrEqual(2);
  });

  it("handles very small differences (precision)", () => {
    const mockComparison = { homeAvg: 100.001, globalAvg: 100.002 };
    render(<ComparisonStat comparison={mockComparison} />);
    // 100.001 < 100.002 is true, so shows Better
    expect(screen.getByText(/0\.0% Better/)).toBeInTheDocument();
  });

  it("handles negative averages (invalid data)", () => {
    const mockComparison = { homeAvg: -50, globalAvg: 100 };
    render(<ComparisonStat comparison={mockComparison} />);
    // Should still render and show as "better"
    expect(screen.getByText("-50 g")).toBeInTheDocument();
  });

  it("handles extreme percentage difference (>1000%)", () => {
    const mockComparison = { homeAvg: 1000, globalAvg: 10 };
    render(<ComparisonStat comparison={mockComparison} />);
    expect(screen.getByText(/9900\.0% Higher/)).toBeInTheDocument();
  });
});

describe("Boundary Testing - TopContributor Component", () => {
  it("handles empty appliances object", () => {
    render(<TopContributor applianceTotals={{}} topAppliance={null} />);
    expect(screen.getByText("No Data Yet")).toBeInTheDocument();
  });

  it("handles single appliance at 100% contribution", () => {
    const mockApplianceTotals = { refrigerator: 500 };
    render(
      <TopContributor
        applianceTotals={mockApplianceTotals}
        topAppliance="refrigerator"
      />
    );
    expect(screen.getByText("100.0%")).toBeInTheDocument();
  });

  it("handles zero emission appliance", () => {
    const mockApplianceTotals = {
      airConditioner: 0,
      refrigerator: 100,
    };
    render(
      <TopContributor
        applianceTotals={mockApplianceTotals}
        topAppliance="airConditioner"
      />
    );
    expect(screen.getByText("0.0")).toBeInTheDocument();
    expect(screen.getByText("0.0%")).toBeInTheDocument();
  });

  it("handles very long appliance names", () => {
    const mockApplianceTotals = {
      veryLongApplianceNameThatExceedsNormalLimits: 500,
    };
    render(
      <TopContributor
        applianceTotals={mockApplianceTotals}
        topAppliance="veryLongApplianceNameThatExceedsNormalLimits"
      />
    );
    // Should render without layout breaking
    expect(screen.getByText(/Very Long Appliance Name/)).toBeInTheDocument();
  });

  it("handles appliance name with special characters", () => {
    const mockApplianceTotals = {
      "ac-unit-2000": 300,
    };
    render(
      <TopContributor
        applianceTotals={mockApplianceTotals}
        topAppliance="ac-unit-2000"
      />
    );
    expect(screen.getByText("300.0")).toBeInTheDocument();
  });

  it("handles negative emission values (invalid but defensive)", () => {
    const mockApplianceTotals = {
      refrigerator: -50,
      washingMachine: 100,
    };
    render(
      <TopContributor
        applianceTotals={mockApplianceTotals}
        topAppliance="refrigerator"
      />
    );
    expect(screen.getByText("-50.0")).toBeInTheDocument();
  });

  it("handles NaN values in appliance totals", () => {
    const mockApplianceTotals = {
      refrigerator: NaN,
      washingMachine: 100,
    };
    render(
      <TopContributor
        applianceTotals={mockApplianceTotals}
        topAppliance="refrigerator"
      />
    );
    // Component converts NaN to 0.0 via Number() coercion
    expect(screen.getByText("0.0")).toBeInTheDocument();
  });
});

describe("Boundary Testing - String/Number Conversions", () => {
  it("handles string numbers in emissions", () => {
    const mockSummary = { totalEmissions: "123.45" };
    render(<TotalCard summary={mockSummary} />);
    // Should coerce to number
    expect(screen.getByText("123.5")).toBeInTheDocument();
  });

  it("handles boolean in emissions (edge case)", () => {
    const mockSummary = { totalEmissions: true }; // Number(true) = 1
    render(<TotalCard summary={mockSummary} />);
    expect(screen.getByText("1.0")).toBeInTheDocument();
  });

  it("handles array in emissions (invalid)", () => {
    const mockSummary = { totalEmissions: [100] };
    render(<TotalCard summary={mockSummary} />);
    // Arrays don't have toFixed, but component should handle gracefully
    expect(screen.getByText("gCO₂")).toBeInTheDocument();
  });
});
