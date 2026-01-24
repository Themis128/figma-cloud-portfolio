/** @jsxImportSource react */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import Navigation from "../client/components/Navigation";

const renderWithRouter = (component: React.ReactElement, initialEntries = ["/"]) => {
  return render(<MemoryRouter initialEntries={initialEntries}>{component}</MemoryRouter>);
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
      const links = screen.getAllByRole("link", { name: item });
      expect(links.length).toBeGreaterThan(0);
    });
  });

  it("should highlight active link", () => {
    renderWithRouter(<Navigation />, ["/about"]);

    // Get all About links and find the desktop one (which should be active)
    const aboutLinks = screen.getAllByRole("link", { name: "About" });
    const desktopAboutLink = aboutLinks.find(
      (link) => link.className.includes("text-cyan-400") && link.className.includes("border-b-2"),
    );
    expect(desktopAboutLink).toBeInTheDocument();

    // Check that Resume link is not active (desktop version should not have cyan color)
    const resumeLinks = screen.getAllByRole("link", { name: "Resume" });
    const desktopResumeLink = resumeLinks.find(
      (link) => !link.className.includes("block"), // desktop version
    );
    expect(desktopResumeLink).not.toHaveClass("text-cyan-400");
    expect(desktopResumeLink).toHaveClass("text-white/80");
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

    // Check if mobile menu is visible by looking for the menu container with max-h-96
    const mobileMenu = document.querySelector(".md\\:hidden.absolute");
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

    // Click on the mobile navigation link (the one with block styling)
    const aboutLinks = screen.getAllByRole("link", { name: "About" });
    const mobileAboutLink = aboutLinks.find(
      (link) => link.className.includes("block") && link.className.includes("w-full"),
    );

    if (mobileAboutLink) {
      await user.click(mobileAboutLink);
    }

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
