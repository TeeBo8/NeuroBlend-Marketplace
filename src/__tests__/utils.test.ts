import { describe, it, expect } from "vitest";
import { cn, formatPrice, formatDate, slugify, truncate, isDefined } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("merges Tailwind classes correctly", () => {
    expect(cn("px-4", "px-8")).toBe("px-8");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles undefined and null", () => {
    expect(cn("base", undefined, null, "end")).toBe("base end");
  });
});

describe("formatPrice", () => {
  it("formats number as EUR by default", () => {
    const result = formatPrice(9.9);
    expect(result).toContain("9,90");
    expect(result).toContain("€");
  });

  it("formats string price", () => {
    const result = formatPrice("14.90");
    expect(result).toContain("14,90");
  });

  it("formats zero", () => {
    const result = formatPrice(0);
    expect(result).toContain("0,00");
  });

  it("formats USD when specified", () => {
    const result = formatPrice(10, { currency: "USD" });
    expect(result).toContain("$");
  });

  it("handles large numbers", () => {
    const result = formatPrice(1234.56);
    // French format uses space or narrow no-break space for thousands
    expect(result).toContain("234,56");
  });
});

describe("formatDate", () => {
  it("formats date object", () => {
    const date = new Date("2025-01-15");
    const result = formatDate(date);
    expect(result).toContain("janvier");
    expect(result).toContain("2025");
  });

  it("formats date string", () => {
    const result = formatDate("2025-06-01");
    expect(result).toContain("juin");
    expect(result).toContain("2025");
  });

  it("uses custom options", () => {
    const result = formatDate("2025-03-15", {
      month: "short",
      year: "numeric",
    });
    expect(result).toContain("2025");
  });
});

describe("slugify", () => {
  it("converts to lowercase", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes accents", () => {
    expect(slugify("Café Crème")).toBe("cafe-creme");
  });

  it("replaces special characters with hyphens", () => {
    expect(slugify("hello@world!")).toBe("hello-world");
  });

  it("removes leading and trailing hyphens", () => {
    expect(slugify("---hello---")).toBe("hello");
  });

  it("handles multiple spaces", () => {
    expect(slugify("hello   world")).toBe("hello-world");
  });

  it("handles French characters", () => {
    expect(slugify("Haut Potentiel Intellectuel")).toBe(
      "haut-potentiel-intellectuel"
    );
  });
});

describe("truncate", () => {
  it("returns full string if shorter than limit", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates and adds ellipsis", () => {
    expect(truncate("hello world", 5)).toBe("hello...");
  });

  it("returns exact length string unchanged", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });

  it("handles empty string", () => {
    expect(truncate("", 5)).toBe("");
  });
});

describe("isDefined", () => {
  it("returns true for defined values", () => {
    expect(isDefined("hello")).toBe(true);
    expect(isDefined(0)).toBe(true);
    expect(isDefined(false)).toBe(true);
    expect(isDefined("")).toBe(true);
  });

  it("returns false for null", () => {
    expect(isDefined(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isDefined(undefined)).toBe(false);
  });
});
