import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "@/components/ThemeProvider";
import About from "@/pages/About";

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>{component}</ThemeProvider>
    </BrowserRouter>,
  );
};

describe("About Page", () => {
  it("renders the about page", () => {
    renderWithProviders(<About />);

    // Check for the main heading instead of main element
    expect(screen.getByRole("heading", { name: /about me/i, level: 1 })).toBeInTheDocument();
  });

  it("displays about content", () => {
    renderWithProviders(<About />);

    // Check for about section content
    expect(screen.getByText("Cloud Architect & Cybersecurity Specialist")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /professional summary/i })).toBeInTheDocument();
  });

  it("includes personal information", () => {
    renderWithProviders(<About />);

    // Check for personal details section - use getAllByText and check length
    const expertiseTexts = screen.getAllByText(/15\+ years of IT expertise/i);
    expect(expertiseTexts.length).toBeGreaterThan(0);

    expect(screen.getByRole("heading", { name: /top skills/i })).toBeInTheDocument();
  });
});
