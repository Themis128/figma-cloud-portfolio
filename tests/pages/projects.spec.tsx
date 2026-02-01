import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Projects from "@/pages/Projects";

// Constants
const EXPECTED_CARD_COUNT = 4; // 3 stat cards + 1 for 3D demo

// Mock react-helmet-async
vi.mock("react-helmet-async", () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='helmet'>{children}</div>
  ),
}));

// Mock React hooks
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useState: vi.fn(),
    useMemo: vi.fn(),
  };
});

// Mock the components
vi.mock("@/components/Interactive3DDemo", () => ({
  useSampleProjects: () => [
    {
      id: "1",
      title: "Project 1",
      description: "Description 1",
      category: "web",
      technologies: ["React", "TypeScript"],
      year: 2023,
      image: "/project1.jpg",
      demoUrl: "https://demo1.com",
      githubUrl: "https://github.com/project1",
    },
    {
      id: "2",
      title: "Project 2",
      description: "Description 2",
      category: "mobile",
      technologies: ["React Native"],
      year: 2023,
      image: "/project2.jpg",
      demoUrl: "https://demo2.com",
      githubUrl: "https://github.com/project2",
    },
    {
      id: "3",
      title: "Project 3",
      description: "Description 3",
      category: "web",
      technologies: ["Vue.js"],
      year: 2024,
      image: "/project3.jpg",
    },
  ],
  default: ({ projects, className }: { projects: any[]; className?: string }) => (
    <div data-testid='interactive-3d-demo' className={className}>
      3D Demo with {projects.length} projects
    </div>
  ),
}));

// Mock React hooks
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useState: vi.fn(),
    useMemo: vi.fn(),
  };
});

vi.mock("@/components/SearchableProjects", () => ({
  default: ({ projects }: { projects: any[] }) => (
    <div data-testid='searchable-projects'>Grid view with {projects.length} projects</div>
  ),
}));

// Mock UI components
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid='card'>
      {children}
    </div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='card-content'>{children}</div>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='card-description'>{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='card-header'>{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='card-title'>{children}</div>
  ),
}));

vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children, defaultValue }: { children: React.ReactNode; defaultValue?: string }) => (
    <div data-testid='tabs' data-default-value={defaultValue}>
      {children}
    </div>
  ),
  TabsContent: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid={`tab-content-${value}`}>{children}</div>
  ),
  TabsList: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid='tabs-list'>
      {children}
    </div>
  ),
  TabsTrigger: ({
    children,
    value,
    className,
  }: {
    children: React.ReactNode;
    value: string;
    className?: string;
  }) => (
    <button type='button' className={className} data-testid={`tab-trigger-${value}`}>
      {children}
    </button>
  ),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Grid3X3: () => <div data-testid='grid-icon' />,
  Zap: () => <div data-testid='zap-icon' />,
}));

describe("Projects Page", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it("renders the projects page header", () => {
    render(<Projects />);

    expect(screen.getByText("Projects & Portfolio")).toBeInTheDocument();
    expect(screen.getByText("Explore my latest work and technical projects")).toBeInTheDocument();
  });

  it("displays project statistics correctly", () => {
    render(<Projects />);

    // Check total projects (3)
    expect(screen.getByText("3")).toBeInTheDocument();

    // Check web apps count (2)
    expect(screen.getByText("2")).toBeInTheDocument();

    // Check mobile apps count (1)
    expect(screen.getByText("1")).toBeInTheDocument();

    // Check statistic labels
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("Web Apps")).toBeInTheDocument();
    expect(screen.getByText("Mobile App")).toBeInTheDocument();
  });

  it("renders tabs with correct structure", () => {
    render(<Projects />);

    expect(screen.getByTestId("tabs")).toBeInTheDocument();
    expect(screen.getByTestId("tabs-list")).toBeInTheDocument();
    expect(screen.getByTestId("tab-trigger-grid")).toBeInTheDocument();
    expect(screen.getByTestId("tab-trigger-3d")).toBeInTheDocument();
  });

  it("displays tab labels with icons", () => {
    render(<Projects />);

    expect(screen.getByText("Grid View")).toBeInTheDocument();
    expect(screen.getByText("3D Demo")).toBeInTheDocument();
    expect(screen.getByTestId("grid-icon")).toBeInTheDocument();
    expect(screen.getAllByTestId("zap-icon")).toHaveLength(2); // One in tab trigger, one in card title
  });

  it("renders grid view content", () => {
    render(<Projects />);

    const gridContent = screen.getByTestId("tab-content-grid");
    expect(gridContent).toBeInTheDocument();
    expect(screen.getByTestId("searchable-projects")).toBeInTheDocument();
    expect(screen.getByText("Grid view with 3 projects")).toBeInTheDocument();
  });

  it("renders 3D demo content", () => {
    render(<Projects />);

    const demoContent = screen.getByTestId("tab-content-3d");
    expect(demoContent).toBeInTheDocument();
    expect(screen.getByTestId("interactive-3d-demo")).toBeInTheDocument();
    expect(screen.getByText("3D Demo with 3 projects")).toBeInTheDocument();
  });

  it("displays 3D demo description", () => {
    render(<Projects />);

    expect(screen.getByText("Interactive 3D Portfolio Demo")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Experience my projects in an immersive 3D environment. Click and drag to rotate, scroll to zoom.",
      ),
    ).toBeInTheDocument();
  });

  it("includes SEO metadata", () => {
    render(<Projects />);

    const helmet = screen.getByTestId("helmet");
    expect(helmet).toBeInTheDocument();
    // Note: In a real test, you might want to check the Helmet content more thoroughly
  });

  it("has proper styling classes", () => {
    render(<Projects />);

    // Check main container has background gradient
    const container = screen.getByTestId("projects-container");
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass(
      "min-h-screen",
      "bg-gradient-to-br",
      "from-slate-50",
      "to-slate-100",
    );
  });

  it("renders statistics cards", () => {
    render(<Projects />);

    const cards = screen.getAllByTestId("card");
    expect(cards).toHaveLength(EXPECTED_CARD_COUNT); // 3 stat cards + 1 for 3D demo
  });
});
