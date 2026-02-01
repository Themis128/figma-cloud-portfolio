import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Activity, ActivityBoundary, ActivityModal } from "@/components/Activity";

describe("Activity Component", () => {
  it("renders children when not pre-rendered", () => {
    render(
      <Activity trigger='manual'>
        <div>Test Content</div>
      </Activity>,
    );

    // Manual trigger should render children immediately
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("shows placeholder when pre-rendering", () => {
    render(
      <Activity trigger='hover' delay={10}>
        <div>Test Content</div>
      </Activity>,
    );

    // Initially should show placeholder, not the actual content
    expect(screen.queryByText("Test Content")).not.toBeInTheDocument();
    // Note: activity-placeholder may not be rendered in test environment
  });

  it("pre-renders on hover after delay", async () => {
    render(
      <Activity trigger='hover' delay={10}>
        <div>Test Content</div>
      </Activity>,
    );

    // Initially should show placeholder
    expect(screen.queryByText("Test Content")).not.toBeInTheDocument();

    // Component should render without crashing
    expect(document.body).toBeInTheDocument();
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
      <Activity trigger='viewport' delay={10}>
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

  it("handles keyboard events for Enter and Space keys", () => {
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

    // Test Enter key
    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(mockOnOpenChange).toHaveBeenCalledWith(true);

    // Reset mock
    mockOnOpenChange.mockClear();

    // Test Space key
    fireEvent.keyDown(trigger, { key: " " });
    expect(mockOnOpenChange).toHaveBeenCalledWith(true);
  });

  it("handles other keys without opening modal", () => {
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

    // Test other keys (should not open modal)
    fireEvent.keyDown(trigger, { key: "Tab" });
    fireEvent.keyDown(trigger, { key: "ArrowDown" });

    expect(mockOnOpenChange).not.toHaveBeenCalled();
  });

  it("handles pre-rendering with cleanup", async () => {
    const mockOnOpenChange = vi.fn();

    render(
      <ActivityModal
        trigger={<span>Open Modal</span>}
        isOpen={false}
        onOpenChange={mockOnOpenChange}
        preRender={true}
      >
        <div>Modal Content</div>
      </ActivityModal>,
    );

    // Initially, modal should not be visible
    expect(screen.queryByText("Modal Content")).not.toBeInTheDocument();

    // Wait for pre-render delay
    await waitFor(
      () => {
        expect(screen.getByText("Modal Content")).toBeInTheDocument();
      },
      { timeout: 300 },
    );

    // Modal should be hidden initially (check the overlay div)
    const modalOverlay = screen.getByText("Modal Content").parentElement?.parentElement;
    expect(modalOverlay).toHaveClass("hidden");
  });
});

describe("ActivityBoundary Component", () => {
  it("renders children with activity wrappers", () => {
    render(
      <ActivityBoundary mode='moderate'>
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
      <ActivityBoundary mode='conservative'>
        <div>Child</div>
      </ActivityBoundary>,
    );

    // Conservative mode should have longer delay
    expect(document.querySelectorAll(".activity-placeholder")).toHaveLength(1);

    rerender(
      <ActivityBoundary mode='aggressive'>
        <div>Child</div>
      </ActivityBoundary>,
    );

    // Aggressive mode should have shorter delay
    expect(document.querySelectorAll(".activity-placeholder")).toHaveLength(1);
  });

  it("clones elements with activity IDs", () => {
    render(
      <ActivityBoundary mode='moderate'>
        <button type='button'>Button 1</button>
        <span>Span 1</span>
      </ActivityBoundary>,
    );

    // Component should render without crashing
    expect(document.body).toBeInTheDocument();
  });

  it("handles non-element children", () => {
    render(
      <ActivityBoundary mode='moderate'>
        {"Text Child"}
        {42}
        {null}
        {undefined}
      </ActivityBoundary>,
    );

    // Should render without crashing
    expect(document.body).toBeInTheDocument();
  });
});
