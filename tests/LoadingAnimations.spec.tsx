/**
 * Tests for LoadingAnimations components
 * Imports ACTUAL components from client/components/LoadingAnimations.tsx
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoadingDots, LoadingSpinner, PageLoader } from "../client/components/LoadingAnimations";

describe("LoadingSpinner", () => {
  it("renders with default props", () => {
    render(<LoadingSpinner />);
    expect(screen.getByLabelText("Loading spinner")).toBeInTheDocument();
  });

  it("renders with small size", () => {
    const { container } = render(<LoadingSpinner size='sm' />);
    expect(container.firstChild).toHaveClass("w-4", "h-4");
  });

  it("renders with medium size", () => {
    const { container } = render(<LoadingSpinner size='md' />);
    expect(container.firstChild).toHaveClass("w-6", "h-6");
  });

  it("renders with large size", () => {
    const { container } = render(<LoadingSpinner size='lg' />);
    expect(container.firstChild).toHaveClass("w-8", "h-8");
  });

  it("applies custom color", () => {
    const { container } = render(<LoadingSpinner color='text-red-500' />);
    expect(container.firstChild).toHaveClass("text-red-500");
  });

  it("applies custom className", () => {
    const { container } = render(<LoadingSpinner className='my-custom' />);
    expect(container.firstChild).toHaveClass("my-custom");
  });
});

describe("LoadingDots", () => {
  it("renders three dots", () => {
    const { container } = render(<LoadingDots />);
    expect(container.querySelectorAll(".rounded-full")).toHaveLength(3);
  });

  it("renders with small size", () => {
    const { container } = render(<LoadingDots size='sm' />);
    container.querySelectorAll(".rounded-full").forEach((dot) => {
      expect(dot).toHaveClass("w-1", "h-1");
    });
  });

  it("renders with medium size", () => {
    const { container } = render(<LoadingDots size='md' />);
    container.querySelectorAll(".rounded-full").forEach((dot) => {
      expect(dot).toHaveClass("w-2", "h-2");
    });
  });

  it("renders with large size", () => {
    const { container } = render(<LoadingDots size='lg' />);
    container.querySelectorAll(".rounded-full").forEach((dot) => {
      expect(dot).toHaveClass("w-3", "h-3");
    });
  });

  it("applies custom color", () => {
    const { container } = render(<LoadingDots color='bg-red-500' />);
    container.querySelectorAll(".rounded-full").forEach((dot) => {
      expect(dot).toHaveClass("bg-red-500");
    });
  });
});

describe("PageLoader", () => {
  it("renders with default message", () => {
    render(<PageLoader />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders with custom message", () => {
    render(<PageLoader message='Please wait...' />);
    expect(screen.getByText("Please wait...")).toBeInTheDocument();
  });

  it("has fixed positioning", () => {
    const { container } = render(<PageLoader />);
    expect(container.firstChild).toHaveClass("fixed", "inset-0", "z-50");
  });

  it("includes LoadingSpinner", () => {
    render(<PageLoader />);
    expect(screen.getByLabelText("Loading spinner")).toBeInTheDocument();
  });
});
