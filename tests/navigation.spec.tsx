/** @jsxImportSource react */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import Navigation from "../client/components/Navigation";

const renderWithRouter = (component: React.ReactElement, initialEntries = ["/"]) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {component}
    </MemoryRouter>
  );
};

describe("Navigation", () => {
  it("should render navigation with logo", () => {
    renderWithRouter(<Navigation />);
    const logo = screen.getByRole("link", { name: /home/i });
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveTextContent("TB");
  });

  it("should render all navigation links", () => {
    renderWithRouter(<Navigation />);
    const navigationItems = ["About", "Resume", "Contact", "Performance", "Agents"];

    navigationItems.forEach((item) => {
      expect(screen.getByRole("link", { name: item })).toBeInTheDocument();
    });
  });

  it("should highlight active link", () => {
    renderWithRouter(<Navigation />, ["/about"]);

    const aboutLink = screen.getByRole("link", { name: "About" });
    expect(aboutLink).toHaveClass("text-cyan-400", "border-b-2", "border-cyan-400");

    const resumeLink = screen.getByRole("link", { name: "Resume" });
    expect(resumeLink).not.toHaveClass("text-cyan-400");
  });

  it("should show mobile menu button on small screens", () => {
    renderWithRouter(<Navigation />);
    const menuButton = screen.getByRole("button", { name: /toggle menu/i });
    expect(menuButton).toBeInTheDocument();
  });

  it("should toggle mobile menu when button is clicked", async () => {
    const user = userEvent.setup();
    renderWithRouter(<Navigation />);

    const menuButton = screen.getByRole("button", { name: /toggle menu/i });

    // Menu should be closed initially
    expect(menuButton).toHaveAttribute("aria-expanded", "false");

    // Open menu
    await user.click(menuButton);
    expect(menuButton).toHaveAttribute("aria-expanded", "true");

    // Check if mobile menu is visible
    const mobileMenu = screen.getByText("About").closest("div");
    expect(mobileMenu).toHaveClass("max-h-96", "opacity-100");

    // Close menu
    await user.click(menuButton);
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  it("should close mobile menu when navigation link is clicked", async () => {
    const user = userEvent.setup();
    renderWithRouter(<Navigation />);

    const menuButton = screen.getByRole("button", { name: /toggle menu/i });

    // Open menu
    await user.click(menuButton);
    expect(menuButton).toHaveAttribute("aria-expanded", "true");

    // Click on a navigation link
    const aboutLink = screen.getByRole("link", { name: "About" });
    await user.click(aboutLink);

    // Menu should be closed
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  it("should render CTA button in mobile menu", async () => {
    const user = userEvent.setup();
    renderWithRouter(<Navigation />);

    const menuButton = screen.getByRole("button", { name: /toggle menu/i });
    await user.click(menuButton);

    const ctaButton = screen.getByRole("link", { name: /get in touch/i });
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveTextContent("Get In Touch");
  });

  it("should have proper accessibility attributes", () => {
    renderWithRouter(<Navigation />);

    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();

    const logo = screen.getByRole("link", { name: /home/i });
    expect(logo).toHaveAttribute("aria-label", "Home");

    const menuButton = screen.getByRole("button", { name: /toggle menu/i });
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });
});