import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AppShell } from "../AppShell";
import { MemoryRouter } from "react-router-dom";

// Mock child components that might try to fetch data or use contexts we don't have here
vi.mock("../Sidebar", () => ({
  Sidebar: () => <div data-testid="sidebar" />
}));

vi.mock("../Topbar", () => ({
  Topbar: () => <div data-testid="topbar" />
}));

describe("AppShell", () => {
  it("renders correctly with Sidebar, Topbar, and Outlet", () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <AppShell />
      </MemoryRouter>
    );
    expect(getByTestId("sidebar")).toBeInTheDocument();
    expect(getByTestId("topbar")).toBeInTheDocument();
  });
});
