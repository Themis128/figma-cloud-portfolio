/** @jsxImportSource react */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Input } from "../client/components/ui/input";

describe("Input", () => {
  it("should render with default props", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass(
      "flex",
      "h-10",
      "w-full",
      "rounded-md",
      "border",
      "border-input",
      "bg-background",
      "px-3",
      "py-2",
      "text-base",
      "ring-offset-background",
    );
  });

  it("should render with different input types", () => {
    const { rerender } = render(<Input type='email' />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");

    rerender(<Input type='password' />);
    expect(screen.getByDisplayValue("")).toHaveAttribute("type", "password");

    rerender(<Input type='number' />);
    expect(screen.getByRole("spinbutton")).toHaveAttribute("type", "number");
  });

  it("should handle placeholder text", () => {
    render(<Input placeholder='Enter your name' />);
    const input = screen.getByPlaceholderText("Enter your name");
    expect(input).toBeInTheDocument();
  });

  it("should handle value changes", async () => {
    const user = userEvent.setup();
    render(<Input />);
    const input = screen.getByRole("textbox");

    await user.type(input, "Hello World");
    expect(input).toHaveValue("Hello World");
  });

  it("should apply custom className", () => {
    render(<Input className='custom-input' />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("custom-input");
  });

  it("should handle disabled state", () => {
    render(<Input disabled />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
    expect(input).toHaveClass("disabled:cursor-not-allowed", "disabled:opacity-50");
  });

  it("should handle readOnly state", () => {
    render(<Input readOnly value='Read only text' />);
    const input = screen.getByDisplayValue("Read only text");
    expect(input).toHaveAttribute("readOnly");
  });

  it("should handle required attribute", () => {
    render(<Input required />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("required");
  });

  it("should forward ref correctly", () => {
    const ref = { current: null };
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("should handle focus and blur events", async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const onBlur = vi.fn();

    render(<Input onFocus={onFocus} onBlur={onBlur} />);
    const input = screen.getByRole("textbox");

    await user.click(input);
    expect(onFocus).toHaveBeenCalledTimes(1);

    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("should handle maxLength", () => {
    render(<Input maxLength={10} />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("maxLength", "10");
  });

  it("should handle pattern validation", () => {
    render(<Input pattern='[A-Za-z]+' title='Only letters allowed' />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("pattern", "[A-Za-z]+");
    expect(input).toHaveAttribute("title", "Only letters allowed");
  });
});
