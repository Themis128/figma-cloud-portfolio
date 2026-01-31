import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

describe("UI Components", () => {
  describe("Label", () => {
    it("should render with default props", () => {
      render(<Label>Label text</Label>);

      const label = screen.getByText("Label text");
      expect(label).toBeInTheDocument();
      expect(label).toHaveClass("text-sm", "font-medium", "leading-none");
    });

    it("should apply custom className", () => {
      render(<Label className='custom-class'>Label text</Label>);

      const label = screen.getByText("Label text");
      expect(label).toHaveClass("custom-class");
    });

    it("should forward ref correctly", () => {
      const ref = { current: null };
      render(<Label ref={ref}>Label text</Label>);

      expect(ref.current).toBeInTheDocument();
    });

    it("should handle htmlFor attribute", () => {
      render(<Label htmlFor='input-id'>Label text</Label>);

      const label = screen.getByText("Label text");
      expect(label).toHaveAttribute("for", "input-id");
    });
  });

  describe("Badge", () => {
    it("should render with default variant", () => {
      render(<Badge>Default Badge</Badge>);

      const badge = screen.getByText("Default Badge");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("inline-flex", "items-center", "rounded-full");
    });

    it("should render different variants", () => {
      const { rerender } = render(<Badge variant='secondary'>Secondary</Badge>);
      expect(screen.getByText("Secondary")).toHaveClass("bg-secondary");

      rerender(<Badge variant='destructive'>Destructive</Badge>);
      expect(screen.getByText("Destructive")).toHaveClass("bg-destructive");

      rerender(<Badge variant='outline'>Outline</Badge>);
      expect(screen.getByText("Outline")).toHaveClass("text-foreground");
    });

    it("should apply custom className", () => {
      render(<Badge className='custom-badge'>Custom Badge</Badge>);

      const badge = screen.getByText("Custom Badge");
      expect(badge).toHaveClass("custom-badge");
    });

    it("should handle focus and keyboard events", () => {
      render(<Badge tabIndex={0}>Focusable Badge</Badge>);

      const badge = screen.getByText("Focusable Badge");
      expect(badge).toHaveAttribute("tabindex", "0");
    });
  });

  describe("Progress", () => {
    it("should render with default props", () => {
      render(<Progress />);

      const progress = screen.getByRole("progressbar");
      expect(progress).toBeInTheDocument();
      expect(progress).toHaveClass("relative", "h-4", "w-full");
    });

    it("should handle value prop", () => {
      render(<Progress value={50} />);

      const progress = screen.getByRole("progressbar");
      expect(progress).toBeInTheDocument();

      // Check that the indicator exists and has the correct style
      const indicator = progress.firstElementChild;
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveStyle({ transform: "translateX(-50%)" });
    });

    it("should handle zero value", () => {
      render(<Progress value={0} />);

      const progress = screen.getByRole("progressbar");
      const indicator = progress.firstElementChild;
      expect(indicator).toHaveStyle({ transform: "translateX(-100%)" });
    });

    it("should handle max value", () => {
      render(<Progress value={100} />);

      const progress = screen.getByRole("progressbar");
      const indicator = progress.firstElementChild;
      expect(indicator).toHaveStyle({ transform: "translateX(-0%)" });
    });

    it("should apply custom className", () => {
      render(<Progress className='custom-progress' />);

      const progress = screen.getByRole("progressbar");
      expect(progress).toHaveClass("custom-progress");
    });

    it("should forward ref correctly", () => {
      const ref = { current: null };
      render(<Progress ref={ref} />);

      expect(ref.current).toBeInTheDocument();
    });
  });

  describe("Separator", () => {
    it("should render horizontal separator by default", () => {
      render(<Separator />);

      const separator = screen.getByRole("none");
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveClass("shrink-0", "bg-border", "h-[1px]", "w-full");
      expect(separator).toHaveAttribute("data-orientation", "horizontal");
    });

    it("should render vertical separator", () => {
      render(<Separator orientation='vertical' />);

      const separator = screen.getByRole("none");
      expect(separator).toHaveClass("h-full", "w-[1px]");
      expect(separator).toHaveAttribute("data-orientation", "vertical");
    });

    it("should apply custom className", () => {
      render(<Separator className='custom-separator' />);

      const separator = screen.getByRole("none");
      expect(separator).toHaveClass("custom-separator");
    });

    it("should be decorative by default", () => {
      render(<Separator />);

      const separator = screen.getByRole("none");
      expect(separator).toHaveAttribute("data-orientation", "horizontal");
    });
  });

  describe("Switch", () => {
    it("should render with default props", () => {
      render(<Switch />);

      const switchElement = screen.getByRole("switch");
      expect(switchElement).toBeInTheDocument();
      expect(switchElement).toHaveAttribute("type", "button");
    });

    it("should handle checked state", () => {
      const { rerender } = render(<Switch checked={true} />);

      let switchElement = screen.getByRole("switch");
      expect(switchElement).toBeChecked();

      rerender(<Switch checked={false} />);
      switchElement = screen.getByRole("switch");
      expect(switchElement).not.toBeChecked();
    });

    it("should handle onCheckedChange callback", () => {
      const handleChange = vi.fn();
      render(<Switch onCheckedChange={handleChange} />);

      const switchElement = screen.getByRole("switch");
      fireEvent.click(switchElement);

      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it("should apply custom className", () => {
      render(<Switch className='custom-switch' />);

      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveClass("custom-switch");
    });

    it("should handle disabled state", () => {
      render(<Switch disabled />);

      const switchElement = screen.getByRole("switch");
      expect(switchElement).toBeDisabled();
    });
  });

  describe("Tabs", () => {
    it("should render tabs with default value", () => {
      render(
        <Tabs defaultValue='tab1'>
          <TabsList>
            <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
            <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value='tab1'>Content 1</TabsContent>
          <TabsContent value='tab2'>Content 2</TabsContent>
        </Tabs>,
      );

      expect(screen.getByText("Tab 1")).toBeInTheDocument();
      expect(screen.getByText("Tab 2")).toBeInTheDocument();
      expect(screen.getByText("Content 1")).toBeInTheDocument();
      expect(screen.queryByText("Content 2")).not.toBeInTheDocument();
    });

    it("should render tab triggers", () => {
      render(
        <Tabs defaultValue='tab1'>
          <TabsList>
            <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
            <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value='tab1'>Content 1</TabsContent>
          <TabsContent value='tab2'>Content 2</TabsContent>
        </Tabs>,
      );

      const tab1Trigger = screen.getByText("Tab 1");
      const tab2Trigger = screen.getByText("Tab 2");

      expect(tab1Trigger).toHaveAttribute("data-state", "active");
      expect(tab2Trigger).toHaveAttribute("data-state", "inactive");
    });

    it("should apply custom className", () => {
      render(
        <Tabs className='custom-tabs'>
          <TabsList>
            <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value='tab1'>Content 1</TabsContent>
        </Tabs>,
      );

      const tabs = screen.getByRole("tablist").parentElement;
      expect(tabs).toHaveClass("custom-tabs");
    });

    it("should handle controlled value", () => {
      const { rerender } = render(
        <Tabs value='tab1'>
          <TabsList>
            <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
            <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value='tab1'>Content 1</TabsContent>
          <TabsContent value='tab2'>Content 2</TabsContent>
        </Tabs>,
      );

      expect(screen.getByText("Content 1")).toBeInTheDocument();

      rerender(
        <Tabs value='tab2'>
          <TabsList>
            <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
            <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value='tab1'>Content 1</TabsContent>
          <TabsContent value='tab2'>Content 2</TabsContent>
        </Tabs>,
      );

      expect(screen.getByText("Content 2")).toBeInTheDocument();
    });
  });
});
