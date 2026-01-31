import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Product from "@/pages/Product";

// Mock the components
vi.mock("@/components/CircuitBackground", () => ({
  default: () => <div data-testid='circuit-background' />,
}));

vi.mock("@/components/Navigation", () => ({
  default: () => <div data-testid='navigation' />,
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Building: () => <div data-testid='building-icon' />,
  Calendar: () => <div data-testid='calendar-icon' />,
  MapPin: () => <div data-testid='map-pin-icon' />,
}));

describe("Product Page", () => {
  const renderProduct = () => {
    return render(
      <BrowserRouter>
        <Product />
      </BrowserRouter>,
    );
  };

  it("renders the product page", () => {
    renderProduct();

    expect(screen.getByText("Professional Experience")).toBeInTheDocument();
    expect(
      screen.getByText(
        "15+ years of IT expertise across cloud architecture, cybersecurity, and enterprise solutions.",
      ),
    ).toBeInTheDocument();
  });

  it("displays all work experiences", () => {
    renderProduct();

    // Check for key companies
    expect(screen.getByText("Estarta Solutions")).toBeInTheDocument();
    expect(screen.getByText("Cosmos Business Systems Group")).toBeInTheDocument();
    expect(screen.getByText("CPI SA (Outsourced @ Nielsen Greece)")).toBeInTheDocument();
    expect(screen.getByText("Printec Group")).toBeInTheDocument();
    expect(screen.getByText("Germanos")).toBeInTheDocument();
    expect(screen.getByText("INFORM")).toBeInTheDocument();
  });

  it("displays experience details correctly", () => {
    renderProduct();

    // Check positions
    expect(screen.getByText("Systems and Network Engineer")).toBeInTheDocument();
    expect(screen.getByText("Information Technology Support Engineer")).toBeInTheDocument();

    // Check periods
    expect(screen.getByText("December 2024 - March 2025")).toBeInTheDocument();
    expect(screen.getByText("March 2023 - May 2024")).toBeInTheDocument();

    // Check locations (some contain "Greece", others have full addresses)
    expect(screen.getAllByText("Greece")).toHaveLength(2); // Estarta Solutions and Cosmos
    expect(screen.getByText("Athens, Attiki, Greece")).toBeInTheDocument(); // CPI SA
    expect(screen.getByText("Athens International Airport")).toBeInTheDocument(); // Printec Group
  });

  it("displays responsibilities for each experience", () => {
    renderProduct();

    // Check some key responsibilities
    expect(
      screen.getByText(
        "Design, deploy, and manage Cisco virtualization platforms including Cisco UCS (Unified Computing System), HyperFlex, and Cisco ACI (Application Centric Infrastructure)",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Azure Active Directory (Azure AD) Support: Managed and troubleshooted Azure Active Directory services, maintained secure identity and access management",
      ),
    ).toBeInTheDocument();
  });

  it("renders navigation and circuit background components", () => {
    renderProduct();

    expect(screen.getByTestId("navigation")).toBeInTheDocument();
    expect(screen.getByTestId("circuit-background")).toBeInTheDocument();
  });

  it("displays education section", () => {
    renderProduct();

    expect(screen.getByText("Education")).toBeInTheDocument();
    expect(screen.getByText("Master's Degree")).toBeInTheDocument();
    expect(screen.getByText("Bachelor's Degree")).toBeInTheDocument();
  });

  it("displays education details", () => {
    renderProduct();

    expect(screen.getByText("Data Analytics and Technologies")).toBeInTheDocument();
    expect(screen.getByText("University of Greater Manchester")).toBeInTheDocument();
    expect(screen.getByText("Computer Science")).toBeInTheDocument();
    expect(screen.getByText("Hellenic Open University")).toBeInTheDocument();
  });

  it("displays certifications", () => {
    renderProduct();

    expect(screen.getByText("Additional Certifications")).toBeInTheDocument();
    expect(screen.getByText("Cisco CCNA (2021-2022)")).toBeInTheDocument();
    expect(screen.getByText("Cisco DevNet Associate (2023-2024)")).toBeInTheDocument();
    expect(screen.getByText("AWS Certified Solutions Architect")).toBeInTheDocument();
    expect(screen.getByText("Android App Development")).toBeInTheDocument();
  });

  it("displays call to action button", () => {
    renderProduct();

    const contactLink = screen.getByRole("link", { name: /let's work together/i });
    expect(contactLink).toBeInTheDocument();
    expect(contactLink).toHaveAttribute("href", "/contact");
  });

  it("renders icons correctly", () => {
    renderProduct();

    // Check that icons are rendered (multiple instances expected)
    const buildingIcons = screen.getAllByTestId("building-icon");
    const calendarIcons = screen.getAllByTestId("calendar-icon");
    const mapPinIcons = screen.getAllByTestId("map-pin-icon");

    expect(buildingIcons.length).toBeGreaterThan(0);
    expect(calendarIcons.length).toBeGreaterThan(0);
    expect(mapPinIcons.length).toBeGreaterThan(0);
  });

  it("has proper styling classes", () => {
    renderProduct();

    // Check main container has background gradient
    const container = document.querySelector(".min-h-screen.bg-gradient-to-br");
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass("from-navy-800");
  });
});
