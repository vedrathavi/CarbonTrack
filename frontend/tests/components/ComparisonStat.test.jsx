import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ComparisonStat from "@/components/Dashboard/ComparisonStat";

describe("ComparisonStat Component", () => {
  it("renders nothing when no comparison data provided", () => {
    const { container } = render(<ComparisonStat comparison={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("displays home average correctly", () => {
    const mockComparison = {
      homeAvg: 150,
      globalAvg: 200,
    };

    render(<ComparisonStat comparison={mockComparison} />);
    expect(screen.getByText("150 g")).toBeInTheDocument();
    expect(screen.getByText("Your Average")).toBeInTheDocument();
  });

  it("displays global average correctly", () => {
    const mockComparison = {
      homeAvg: 150,
      globalAvg: 200,
    };

    render(<ComparisonStat comparison={mockComparison} />);
    expect(screen.getByText("200 g")).toBeInTheDocument();
    expect(screen.getByText("Global Average")).toBeInTheDocument();
  });

  it('shows "Better" status when home average is lower', () => {
    const mockComparison = {
      homeAvg: 150,
      globalAvg: 200,
    };

    render(<ComparisonStat comparison={mockComparison} />);
    // "Better" appears twice, use more specific text
    expect(screen.getByText("Better than global average")).toBeInTheDocument();
    expect(screen.getByText(/25\.0% Better/)).toBeInTheDocument();
    expect(screen.getByText("Ahead")).toBeInTheDocument();
  });

  it('shows "Higher" status when home average exceeds global', () => {
    const mockComparison = {
      homeAvg: 250,
      globalAvg: 200,
    };

    render(<ComparisonStat comparison={mockComparison} />);
    expect(screen.getByText(/Higher/)).toBeInTheDocument();
    expect(screen.getByText("Reduce your footprint")).toBeInTheDocument();
    expect(screen.getByText("Catch Up")).toBeInTheDocument();
  });

  it("calculates percentage difference correctly", () => {
    const mockComparison = {
      homeAvg: 150,
      globalAvg: 200,
    };

    render(<ComparisonStat comparison={mockComparison} />);
    // (200 - 150) / 200 * 100 = 25%
    expect(screen.getByText(/25\.0% Better/)).toBeInTheDocument();
  });

  it("displays difference in grams", () => {
    const mockComparison = {
      homeAvg: 150,
      globalAvg: 200,
    };

    render(<ComparisonStat comparison={mockComparison} />);
    expect(screen.getByText("50.0g")).toBeInTheDocument();
  });
});
