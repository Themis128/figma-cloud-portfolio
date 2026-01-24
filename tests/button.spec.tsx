/** @jsxImportSource react */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "../client/components/ui/button";

describe("Button", () => {
  it("should render with default props", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass(
      "inline-flex",
      "items-center",
      "justify-center",
      "gap-2",
      "whitespace-nowrap",
      "rounded-md",
      "text-sm",
      "font-medium",
      "h-10",
      "px-4",
      "py-2",
      "bg-primary",
      "text-primary-foreground",
    );
  });

  it("should render different variants", () => {
    const { rerender } = render(<Button variant='destructive'>Destructive</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-destructive", "text-destructive-foreground");

    rerender(<Button variant='outline'>Outline</Button>);
    expect(screen.getByRole("button")).toHaveClass("border", "border-input", "bg-background");

    rerender(<Button variant='secondary'>Secondary</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-secondary", "text-secondary-foreground");

    rerender(<Button variant='ghost'>Ghost</Button>);
    expect(screen.getByRole("button")).toHaveClass("hover:bg-accent");

    rerender(<Button variant='link'>Link</Button>);
    expect(screen.getByRole("button")).toHaveClass("text-primary", "underline-offset-4");
  });

  it("should render different sizes", () => {
    const { rerender } = render(<Button size='sm'>Small</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-9", "rounded-md", "px-3");

    rerender(<Button size='lg'>Large</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-11", "rounded-md", "px-8");

    rerender(<Button size='icon'>Icon</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-10", "w-10");
  });

  it("should apply custom className", () => {
    render(<Button className='custom-class'>Custom</Button>);
    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });

  it("should handle click events", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole("button");

    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:pointer-events-none", "disabled:opacity-50");
  });

  it("should render as child component when asChild is true", () => {
    render(
      <Button asChild>
        <a href='/test'>Link Button</a>
      </Button>,
    );

    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
    expect(link).toHaveClass("inline-flex"); // Should still have button classes
  });

  it("should forward ref correctly", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<Button ref={ref}>Button with ref</Button>);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current?.textContent).toBe("Button with ref");
  });

  it("should handle focus and keyboard events", async () => {
    const user = userEvent.setup();
    render(<Button>Focusable</Button>);
    const button = screen.getByRole("button");

    button.focus();
    expect(button).toHaveFocus();

    await user.keyboard("{Enter}");
    // Should work without throwing errors
  });

  it("should render with icons", () => {
    render(
      <Button>
        <svg data-testid='icon' />
        With Icon
      </Button>,
    );

    const button = screen.getByRole("button");
    const icon = screen.getByTestId("icon");

    expect(icon).toBeInTheDocument();
    expect(button).toContainElement(icon);

    // Verify the button has the base classes that include SVG styling
    expect(button).toHaveClass("inline-flex", "items-center", "justify-center");
  });
});
