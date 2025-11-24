import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TotalCard from "@/components/Dashboard/TotalCard";

describe("TotalCard Component", () => {
  it("renders nothing when no summary provided", () => {
    const { container } = render(<TotalCard summary={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("displays total emissions correctly", () => {
    const mockSummary = {
      totalEmissions: 25.5,
      peakHour: 18,
      topAppliance: "Air Conditioner",
    };

    render(<TotalCard summary={mockSummary} />);
    expect(screen.getByText("25.5")).toBeInTheDocument();
    expect(screen.getByText("gCO₂")).toBeInTheDocument();
  });

  it("displays greeting message based on time", () => {
    const mockSummary = {
      totalEmissions: 25.5,
    };

    render(<TotalCard summary={mockSummary} />);
    expect(
      screen.getByText(/Good (morning|afternoon|evening)/)
    ).toBeInTheDocument();
    expect(screen.getByText("Your carbon footprint")).toBeInTheDocument();
  });

  it("shows motivational message for low emissions", () => {
    const mockSummary = {
      totalEmissions: 3000,
    };

    render(<TotalCard summary={mockSummary} />);
    expect(screen.getByText("Great job! You're on track")).toBeInTheDocument();
  });
});
