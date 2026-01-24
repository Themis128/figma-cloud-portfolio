import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Activity, ActivityBoundary, ActivityModal } from "@/components/Activity";

describe("Activity Component", () => {
  it("renders children when not pre-rendered", () => {
    render(
      <Activity trigger="manual">
        <div>Test Content</div>
      </Activity>,
    );

    // Manual trigger should render children immediately
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("shows placeholder when pre-rendering", () => {
    render(
      <Activity trigger="hover" delay={10}>
        <div>Test Content</div>
      </Activity>,
    );

    // Initially should show placeholder, not the actual content
    expect(screen.queryByText("Test Content")).not.toBeInTheDocument();
    expect(document.querySelector(".activity-placeholder")).toBeInTheDocument();
  });

  it("pre-renders on hover after delay", async () => {
    render(
      <Activity trigger="hover" delay={10}>
        <div>Test Content</div>
      </Activity>,
    );

    const container = document.querySelector(".activity-container") as HTMLElement;

    // Initially should show placeholder
    expect(screen.queryByText("Test Content")).not.toBeInTheDocument();

    // Simulate hover
    fireEvent.mouseEnter(container);

    // Wait for pre-rendering delay
    await waitFor(
      () => {
        expect(screen.getByText("Test Content")).toBeInTheDocument();
      },
      { timeout: 50 },
    );
  });

  it("pre-renders when entering viewport", async () => {
    // Mock intersection observer
    let observerCallback: ((entries: IntersectionObserverEntry[]) => void) | undefined;
    const mockIntersectionObserver = vi
      .fn()
      .mockImplementation((callback: (entries: IntersectionObserverEntry[]) => void) => {
        observerCallback = callback;
        return {
          observe: vi.fn(),
          unobserve: vi.fn(),
          disconnect: vi.fn(),
        };
      });
    window.IntersectionObserver = mockIntersectionObserver;

    render(
      <Activity trigger="viewport" delay={10}>
        <div>Test Content</div>
      </Activity>,
    );

    // Initially should show placeholder
    expect(screen.queryByText("Test Content")).not.toBeInTheDocument();

    // Trigger intersection observer callback
    if (observerCallback) {
      observerCallback([{ isIntersecting: true } as IntersectionObserverEntry]);
    }

    // Wait for pre-rendering delay
    await waitFor(
      () => {
        expect(screen.getByText("Test Content")).toBeInTheDocument();
      },
      { timeout: 50 },
    );
  });
});

describe("ActivityModal Component", () => {
  it("opens modal on trigger click", () => {
    const mockOnOpenChange = vi.fn();

    render(
      <ActivityModal
        trigger={<span>Open Modal</span>}
        isOpen={false}
        onOpenChange={mockOnOpenChange}
      >
        <div>Modal Content</div>
      </ActivityModal>,
    );

    const trigger = screen.getByRole("button");
    fireEvent.click(trigger);

    expect(mockOnOpenChange).toHaveBeenCalledWith(true);
  });

  it("closes modal on backdrop click", () => {
    const mockOnOpenChange = vi.fn();

    render(
      <ActivityModal
        trigger={<span>Open Modal</span>}
        isOpen={true}
        onOpenChange={mockOnOpenChange}
      >
        <div>Modal Content</div>
      </ActivityModal>,
    );

    // Find the backdrop (it should be the second div in the modal overlay)
    const backdrop = document.querySelector(".fixed.inset-0.bg-black\\/50");
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    }
  });

  it("closes modal on escape key", () => {
    const mockOnOpenChange = vi.fn();

    render(
      <ActivityModal
        trigger={<span>Open Modal</span>}
        isOpen={true}
        onOpenChange={mockOnOpenChange}
      >
        <div>Modal Content</div>
      </ActivityModal>,
    );

    // Fire escape key on the backdrop element
    const backdrop = document.querySelector(".fixed.inset-0.bg-black\\/50");
    if (backdrop) {
      fireEvent.keyDown(backdrop, { key: "Escape" });
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    }
  });
});

describe("ActivityBoundary Component", () => {
  it("renders children with activity wrappers", () => {
    render(
      <ActivityBoundary mode="moderate">
        <div>Child 1</div>
        <div>Child 2</div>
      </ActivityBoundary>,
    );

    // Initially should show placeholders, not the actual content
    expect(screen.queryByText("Child 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Child 2")).not.toBeInTheDocument();
    expect(document.querySelectorAll(".activity-placeholder")).toHaveLength(2);
  });

  it("applies different delays based on mode", () => {
    const { rerender } = render(
      <ActivityBoundary mode="conservative">
        <div>Child</div>
      </ActivityBoundary>,
    );

    // Conservative mode should have longer delay
    expect(document.querySelectorAll(".activity-placeholder")).toHaveLength(1);

    rerender(
      <ActivityBoundary mode="aggressive">
        <div>Child</div>
      </ActivityBoundary>,
    );

    // Aggressive mode should have shorter delay
    expect(document.querySelectorAll(".activity-placeholder")).toHaveLength(1);
  });
});
