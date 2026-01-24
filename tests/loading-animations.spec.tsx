/** @jsxImportSource react */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoadingDots, LoadingSpinner, PageLoader } from "../client/components/LoadingAnimations";

describe("LoadingAnimations", () => {
  describe("LoadingSpinner", () => {
    it("should render with default props", () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByLabelText("Loading spinner");
      expect(spinner).toBeInTheDocument();
      // Check the parent motion.div for classes
      const container = spinner.parentElement;
      expect(container).toHaveClass("w-6", "h-6", "text-cyan-400");
    });

    it("should render different sizes", () => {
      const { rerender } = render(<LoadingSpinner size='sm' />);
      let spinner = screen.getByLabelText("Loading spinner");
      let container = spinner.parentElement;
      expect(container).toHaveClass("w-4", "h-4");

      rerender(<LoadingSpinner size='lg' />);
      spinner = screen.getByLabelText("Loading spinner");
      container = spinner.parentElement;
      expect(container).toHaveClass("w-8", "h-8");
    });

    it("should apply custom color", () => {
      render(<LoadingSpinner color='text-red-500' />);
      const spinner = screen.getByLabelText("Loading spinner");
      const container = spinner.parentElement;
      expect(container).toHaveClass("text-red-500");
    });

    it("should apply custom className", () => {
      render(<LoadingSpinner className='custom-spinner' />);
      const spinner = screen.getByLabelText("Loading spinner");
      const container = spinner.parentElement;
      expect(container).toHaveClass("custom-spinner");
    });

    it("should have proper accessibility", () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByLabelText("Loading spinner");
      expect(spinner).toHaveAttribute("aria-label", "Loading spinner");

      const title = screen.getByText("Loading");
      expect(title).toBeInTheDocument();
    });
  });

  describe("LoadingDots", () => {
    it("should render three dots with default props", () => {
      render(<LoadingDots />);
      const dots = screen.getAllByTestId("loading-dot");
      expect(dots).toHaveLength(3);
      dots.forEach((dot) => {
        expect(dot).toHaveClass("w-2", "h-2", "bg-cyan-400", "rounded-full");
      });
    });

    it("should render different sizes", () => {
      const { rerender } = render(<LoadingDots size='sm' />);
      let dots = screen.getAllByTestId("loading-dot");
      dots.forEach((dot) => {
        expect(dot).toHaveClass("w-1", "h-1");
      });

      rerender(<LoadingDots size='lg' />);
      dots = screen.getAllByTestId("loading-dot");
      dots.forEach((dot) => {
        expect(dot).toHaveClass("w-3", "h-3");
      });
    });

    it("should apply custom color", () => {
      render(<LoadingDots color='bg-blue-500' />);
      const dots = screen.getAllByTestId("loading-dot");
      dots.forEach((dot) => {
        expect(dot).toHaveClass("bg-blue-500");
      });
    });

    it("should apply custom className", () => {
      render(<LoadingDots className='custom-dots' />);
      const container = screen.getByTestId("loading-dots-container");
      expect(container).toHaveClass("custom-dots");
    });

    it("should have proper spacing for different sizes", () => {
      const { rerender } = render(<LoadingDots size='sm' />);
      let container = screen.getByTestId("loading-dots-container");
      expect(container).toHaveClass("space-x-1");

      rerender(<LoadingDots size='md' />);
      container = screen.getByTestId("loading-dots-container");
      expect(container).toHaveClass("space-x-2");

      rerender(<LoadingDots size='lg' />);
      container = screen.getByTestId("loading-dots-container");
      expect(container).toHaveClass("space-x-3");
    });
  });

  describe("PageLoader", () => {
    it("should render with default message", () => {
      render(<PageLoader />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(screen.getByLabelText("Loading spinner")).toBeInTheDocument();
    });

    it("should render with custom message", () => {
      render(<PageLoader message='Please wait...' />);
      expect(screen.getByText("Please wait...")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(<PageLoader className='custom-loader' />);
      const loader = screen.getByText("Loading...").closest(".fixed");
      expect(loader).toHaveClass("custom-loader");
    });

    it("should have proper overlay styling", () => {
      render(<PageLoader />);
      const overlay = screen.getByText("Loading...").closest(".fixed");
      expect(overlay).toHaveClass(
        "fixed",
        "inset-0",
        "z-50",
        "flex",
        "items-center",
        "justify-center",
        "bg-navy-900/80",
        "backdrop-blur-sm",
      );
    });

    it("should center content properly", () => {
      render(<PageLoader />);
      const content = screen.getByText("Loading...").parentElement;
      expect(content).toHaveClass("text-center", "space-y-4");
    });
  });
});
