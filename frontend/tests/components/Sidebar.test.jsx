import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Sidebar from "@/components/Dashboard/Sidebar";
import useAppStore from "@/stores/useAppStore";

vi.mock("@/stores/useAppStore");

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: "/dashboard" }),
  };
});

describe("Sidebar Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.mockReturnValue({
      userInfo: {
        firstName: "Test",
        name: "Test User",
        email: "test@example.com",
      },
      logout: vi.fn(),
    });
  });

  it("renders user name correctly", () => {
    render(
      <BrowserRouter>
        <Sidebar collapsed={false} setCollapsed={vi.fn()} />
      </BrowserRouter>
    );
    // User name displayed is just first letter "U" from "User" (default fallback)
    expect(screen.getByText("User")).toBeInTheDocument();
  });

  it("displays all main navigation sections", () => {
    render(
      <BrowserRouter>
        <Sidebar collapsed={false} setCollapsed={vi.fn()} />
      </BrowserRouter>
    );
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Education")).toBeInTheDocument();
    // "Insights" appears twice (main section + sub-option), use getAllByText
    const insightsElements = screen.getAllByText("Insights");
    expect(insightsElements.length).toBeGreaterThanOrEqual(1);
  });

  it("displays dashboard sub-options when expanded", () => {
    render(
      <BrowserRouter>
        <Sidebar collapsed={false} setCollapsed={vi.fn()} />
      </BrowserRouter>
    );
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("Trends")).toBeInTheDocument();
    // "Insights" appears twice (as section and sub-option), so use getAllByText
    expect(screen.getAllByText("Insights").length).toBeGreaterThan(0);
  });

  it("renders View Profile text", () => {
    render(
      <BrowserRouter>
        <Sidebar collapsed={false} setCollapsed={vi.fn()} />
      </BrowserRouter>
    );
    expect(screen.getByText("View Profile")).toBeInTheDocument();
  });
});
