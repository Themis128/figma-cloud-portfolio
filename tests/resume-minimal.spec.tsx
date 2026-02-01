import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Resume from "@/pages/Resume";

// Mock all external dependencies
vi.mock("@/components/Navigation", () => ({
  default: () => <div data-testid='navigation'>Navigation</div>,
}));

vi.mock("@/components/CircuitBackground", () => ({
  default: () => <div data-testid='circuit-background'>CircuitBackground</div>,
}));

vi.mock("@/lib/api", () => ({
  generateResumePDF: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("react-router-dom", () => ({
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

vi.mock("@radix-ui/react-tabs", () => ({
  Root: ({ children, onValueChange, ...props }: any) => (
    <div {...props} data-on-value-change={!!onValueChange}>
      {children}
    </div>
  ),
  List: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Trigger: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Content: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

vi.mock("@radix-ui/react-dialog", () => ({
  Root: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Trigger: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Content: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Title: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
  Description: ({ children, ...props }: any) => <p {...props}>{children}</p>,
}));

vi.mock("lucide-react", () => ({
  ArrowLeft: () => <div>ArrowLeft</div>,
  Award: () => <div>Award</div>,
  Briefcase: () => <div>Briefcase</div>,
  ChevronRight: () => <div>ChevronRight</div>,
  Download: () => <div>Download</div>,
  Eye: () => <div>Eye</div>,
  EyeOff: () => <div>EyeOff</div>,
  FileText: () => <div>FileText</div>,
  Globe: () => <div>Globe</div>,
  GraduationCap: () => <div>GraduationCap</div>,
  Linkedin: () => <div>Linkedin</div>,
  Mail: () => <div>Mail</div>,
  Plus: () => <div>Plus</div>,
  Save: () => <div>Save</div>,
  Sparkles: () => <div>Sparkles</div>,
  Trash2: () => <div>Trash2</div>,
  User: () => <div>User</div>,
}));

describe("Resume Component - Minimal Test", () => {
  it("should render without crashing", () => {
    expect(() => {
      render(<Resume />);
    }).not.toThrow();
  });
});
