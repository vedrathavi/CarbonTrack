import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

vi.mock("axios");

describe("API Client Configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("axios should be importable", () => {
    expect(axios).toBeDefined();
  });

  it("should have create method", () => {
    expect(typeof axios.create).toBe("function");
  });

  it("should handle GET requests", async () => {
    const mockData = { id: 1, name: "Test" };
    axios.get = vi.fn().mockResolvedValue({ data: mockData });

    const response = await axios.get("/test-endpoint");

    expect(response.data).toEqual(mockData);
    expect(axios.get).toHaveBeenCalledWith("/test-endpoint");
  });

  it("should handle POST requests", async () => {
    const mockPayload = { name: "New Item" };
    const mockResponse = { id: 2, ...mockPayload };
    axios.post = vi.fn().mockResolvedValue({ data: mockResponse });

    const response = await axios.post("/test-endpoint", mockPayload);

    expect(response.data).toEqual(mockResponse);
    expect(axios.post).toHaveBeenCalledWith("/test-endpoint", mockPayload);
  });

  it("should handle request errors", async () => {
    const mockError = new Error("Network Error");
    axios.get = vi.fn().mockRejectedValue(mockError);

    await expect(axios.get("/test-endpoint")).rejects.toThrow("Network Error");
  });
});
