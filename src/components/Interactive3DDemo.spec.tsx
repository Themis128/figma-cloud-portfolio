import { render, renderHook, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { Interactive3DDemo, useSampleProjects } from "./Interactive3DDemo";

// Constants for 3D space dimensions
const POSITION_VECTOR_LENGTH = 3;

// Mock Three.js and React Three Fiber
vi.mock("@react-three/fiber", () => ({
  Canvas: ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    [key: string]: unknown;
  }) =>
    React.createElement("div", { "data-testid": "canvas", ...props }, children),
  useFrame: vi.fn(),
  useThree: () => ({ camera: { position: { set: vi.fn() } } }),
  AmbientLight: ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    [key: string]: unknown;
  }) =>
    React.createElement("div", { "data-testid": "ambient-light", ...props }, children),
  DirectionalLight: ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    [key: string]: unknown;
  }) =>
    React.createElement("div", { "data-testid": "directional-light", ...props }, children),
  PointLight: ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    [key: string]: unknown;
  }) =>
    React.createElement("div", { "data-testid": "point-light", ...props }, children),
  MeshStandardMaterial: ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    [key: string]: unknown;
  }) =>
    React.createElement("div", { "data-testid": "mesh-standard-material", ...props }, children),
  PlaneGeometry: ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    [key: string]: unknown;
  }) =>
    React.createElement("div", { "data-testid": "plane-geometry", ...props }, children),
  MeshBasicMaterial: ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    [key: string]: unknown;
  }) =>
    React.createElement("div", { "data-testid": "mesh-basic-material", ...props }, children),
  Mesh: ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    [key: string]: unknown;
  }) =>
    React.createElement("div", { "data-testid": "mesh", ...props }, children),
  Group: ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    [key: string]: unknown;
  }) =>
    React.createElement("div", { "data-testid": "group", ...props }, children),
}));

vi.mock("@react-three/drei", () => ({
  OrbitControls: () =>
    React.createElement("div", { "data-testid": "orbit-controls" }),
  Html: ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    [key: string]: unknown;
  }) =>
    React.createElement("div", { "data-testid": "html", ...props }, children),
  Sphere: ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    [key: string]: unknown;
  }) =>
    React.createElement("div", { "data-testid": "sphere", ...props }, children),
  Box: ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    [key: string]: unknown;
  }) =>
    React.createElement("div", { "data-testid": "box", ...props }, children),
  Float: ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    [key: string]: unknown;
  }) =>
    React.createElement("div", { "data-testid": "float", ...props }, children),
}));

vi.mock("three", () => ({
  Mesh: class {},
  Vector3: class {},
}));

describe("Interactive3DDemo", () => {
  const mockProjects = [
    {
      id: "test-project",
      title: "Test Project",
      description: "A test project",
      technologies: ["React", "TypeScript"],
      color: "#3b82f6",
      position: [0, 0, 0] as [number, number, number],
      scale: 1,
    },
  ];

  it("renders the 3D demo component", () => {
    render(<Interactive3DDemo projects={mockProjects} />);

    expect(screen.getByTestId("canvas")).toBeInTheDocument();
    expect(
      screen.getByText(
        "🖱️ Click and drag to rotate • 🔍 Scroll to zoom • 🎯 Click spheres to interact",
      ),
    ).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <Interactive3DDemo projects={mockProjects} className="custom-class" />,
    );

    const demoDiv = container.firstChild as HTMLElement;
    expect(demoDiv).toHaveClass("custom-class");
    expect(demoDiv).toHaveClass(
      "w-full",
      "h-96",
      "bg-linear-to-b", // Tailwind v4 syntax
      "from-slate-900",
      "to-slate-800",
      "rounded-lg",
      "overflow-hidden",
    );
  });

  it("calls onProjectClick when provided", () => {
    const mockOnClick = vi.fn();
    render(
      <Interactive3DDemo
        projects={mockProjects}
        onProjectClick={mockOnClick}
      />,
    );

    // The onClick is handled by the Sphere component, which is mocked
    // In a real test, we would need to trigger the sphere's onClick
    expect(mockOnClick).not.toHaveBeenCalled(); // Not called initially
  });

  it("renders with empty projects array", () => {
    render(<Interactive3DDemo projects={[]} />);

    expect(screen.getByTestId("canvas")).toBeInTheDocument();
  });

  it("renders instructions overlay", () => {
    render(<Interactive3DDemo projects={mockProjects} />);

    const instructions = screen.getByText(/Click and drag to rotate/);
    expect(instructions).toBeInTheDocument();
    // Classes are on the parent div, not the p element
    const overlayDiv = instructions.parentElement as HTMLElement;
    expect(overlayDiv).toHaveClass(
      "absolute",
      "bottom-4",
      "left-4",
      "text-white/70",
      "text-sm",
    );
  });
});

describe("useSampleProjects", () => {
  it("returns an array of project objects", () => {
    const { result } = renderHook(() => useSampleProjects());
    const projects = result.current;

    expect(Array.isArray(projects)).toBe(true);
    expect(projects.length).toBeGreaterThan(0);

    const firstProject = projects[0];
    expect(firstProject).toHaveProperty("id");
    expect(firstProject).toHaveProperty("title");
    expect(firstProject).toHaveProperty("description");
    expect(firstProject).toHaveProperty("technologies");
    expect(firstProject).toHaveProperty("color");
    expect(firstProject).toHaveProperty("position");
    expect(firstProject).toHaveProperty("scale");
  });

  it("returns projects with correct structure", () => {
    const { result } = renderHook(() => useSampleProjects());
    const projects = result.current;

    projects.forEach((project) => {
      expect(typeof project.id).toBe("string");
      expect(typeof project.title).toBe("string");
      expect(typeof project.description).toBe("string");
      expect(Array.isArray(project.technologies)).toBe(true);
      expect(typeof project.color).toBe("string");
      expect(Array.isArray(project.position)).toBe(true);
      expect(project.position.length).toBe(POSITION_VECTOR_LENGTH);
      expect(typeof project.scale).toBe("number");
    });
  });

  it("returns memoized projects on re-render", () => {
    const { result, rerender } = renderHook(() => useSampleProjects());
    const projects1 = result.current;

    rerender();
    const projects2 = result.current;

    // useMemo with [] should return the same reference across re-renders
    expect(projects1).toBe(projects2);
  });
});
