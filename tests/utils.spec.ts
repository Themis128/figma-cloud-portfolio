/**
 * Tests for utility functions
 * Imports ACTUAL function from client/lib/utils.ts
 */
import { describe, expect, it } from "vitest";

import { cn } from "../client/lib/utils";

describe("cn utility", () => {
  describe("basic merging", () => {
    it("merges multiple classes", () => {
      expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("handles single class", () => {
      expect(cn("single")).toBe("single");
    });

    it("handles empty input", () => {
      expect(cn()).toBe("");
    });
  });

  describe("conditional classes", () => {
    it("includes truthy conditions", () => {
      expect(cn("base", true && "active")).toBe("base active");
    });

    it("excludes falsy conditions", () => {
      expect(cn("base", false && "active")).toBe("base");
    });

    it("handles null and undefined", () => {
      expect(cn("base", null, undefined, "end")).toBe("base end");
    });
  });

  describe("object notation", () => {
    it("includes truthy object values", () => {
      expect(cn({ active: true, disabled: false })).toBe("active");
    });

    it("mixes string and object", () => {
      expect(cn("base", { active: true, hidden: false })).toBe("base active");
    });
  });

  describe("Tailwind merging", () => {
    it("merges conflicting padding", () => {
      expect(cn("px-2", "px-4")).toBe("px-4");
    });

    it("preserves non-conflicting classes", () => {
      expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    });

    it("merges text colors", () => {
      expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    });

    it("merges backgrounds", () => {
      expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
    });
  });

  describe("complex cases", () => {
    it("handles multiple input types", () => {
      expect(cn("base", true && "active", false && "disabled", { hover: true })).toBe(
        "base active hover",
      );
    });

    it("handles responsive prefixes", () => {
      expect(cn("md:w-1/2", "lg:w-1/3")).toBe("md:w-1/2 lg:w-1/3");
    });

    it("merges responsive conflicts", () => {
      expect(cn("md:w-1/2", "md:w-1/3")).toBe("md:w-1/3");
    });
  });
});
