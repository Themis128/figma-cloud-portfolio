import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import NotFound from "@/pages/NotFound";

// Mock the components
vi.mock("@/components/CircuitBackground", () => ({
  default: () => <div data-testid='circuit-background' />,
}));

vi.mock("@/components/Navigation", () => ({
  default: () => <div data-testid='navigation' />,
}));

describe("NotFound Page", () => {
  const renderNotFound = () => {
    return render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>,
    );
  };

  it("renders the 404 page", () => {
    renderNotFound();

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Oops! Page not found")).toBeInTheDocument();
    expect(
      screen.getByText("The page you're looking for doesn't exist or has been moved."),
    ).toBeInTheDocument();
  });

  it("displays the return to home link", () => {
    renderNotFound();

    const homeLink = screen.getByRole("link", { name: /return to home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("renders navigation component", () => {
    renderNotFound();

    expect(screen.getByTestId("navigation")).toBeInTheDocument();
  });

  it("renders circuit background component", () => {
    renderNotFound();

    expect(screen.getByTestId("circuit-background")).toBeInTheDocument();
  });

  it("has proper styling classes", () => {
    renderNotFound();

    // Find the outermost container with the background gradient
    const container = document.querySelector(".min-h-screen.bg-gradient-to-br");
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass("min-h-screen", "bg-gradient-to-br", "from-navy-800");
  });

  it("has accessible link with proper text", () => {
    renderNotFound();

    const link = screen.getByRole("link", { name: /return to home/i });
    expect(link).toHaveClass("inline-block", "px-8", "py-3");
    expect(link).toHaveClass("border-2", "border-cyan-400/60");
  });
});
