import { describe, it, expect } from "vitest";
import {
  APP_NAME,
  APP_DESCRIPTION,
  PRODUCT_CATEGORIES,
  ROAST_LEVELS,
  ORDER_STATUSES,
  USER_ROLES,
  NAV_LINKS,
  FOOTER_LINKS,
  DEFAULT_COMMISSION_RATE,
} from "@/lib/constants";

describe("App Configuration", () => {
  it("has correct app name", () => {
    expect(APP_NAME).toBe("NeuroBlend");
  });

  it("has non-empty description", () => {
    expect(APP_DESCRIPTION).toBeTruthy();
    expect(APP_DESCRIPTION.length).toBeGreaterThan(10);
  });
});

describe("Product Categories", () => {
  it("has exactly 3 categories", () => {
    expect(PRODUCT_CATEGORIES).toHaveLength(3);
  });

  it("contains HPI, ADHD, and hypersensitive", () => {
    const values = PRODUCT_CATEGORIES.map((c) => c.value);
    expect(values).toContain("HPI");
    expect(values).toContain("ADHD");
    expect(values).toContain("hypersensitive");
  });

  it("each category has label and description", () => {
    PRODUCT_CATEGORIES.forEach((cat) => {
      expect(cat.label).toBeTruthy();
      expect(cat.description).toBeTruthy();
    });
  });
});

describe("Roast Levels", () => {
  it("has exactly 3 levels", () => {
    expect(ROAST_LEVELS).toHaveLength(3);
  });

  it("contains light, medium, dark", () => {
    const values = ROAST_LEVELS.map((r) => r.value);
    expect(values).toEqual(["light", "medium", "dark"]);
  });
});

describe("Order Statuses", () => {
  it("has all expected statuses", () => {
    const statuses = Object.keys(ORDER_STATUSES);
    expect(statuses).toContain("pending");
    expect(statuses).toContain("paid");
    expect(statuses).toContain("processing");
    expect(statuses).toContain("shipped");
    expect(statuses).toContain("delivered");
    expect(statuses).toContain("cancelled");
  });

  it("each status has label and color", () => {
    Object.values(ORDER_STATUSES).forEach((status) => {
      expect(status.label).toBeTruthy();
      expect(status.color).toBeTruthy();
    });
  });
});

describe("User Roles", () => {
  it("has customer, vendor, admin", () => {
    expect(Object.keys(USER_ROLES)).toEqual(["customer", "vendor", "admin"]);
  });

  it("each role has label and description", () => {
    Object.values(USER_ROLES).forEach((role) => {
      expect(role.label).toBeTruthy();
      expect(role.description).toBeTruthy();
    });
  });
});

describe("Navigation", () => {
  it("has nav links with href and label", () => {
    NAV_LINKS.forEach((link) => {
      expect(link.href).toBeTruthy();
      expect(link.label).toBeTruthy();
    });
  });

  it("all nav hrefs start with /", () => {
    NAV_LINKS.forEach((link) => {
      expect(link.href.startsWith("/")).toBe(true);
    });
  });

  it("footer has all sections", () => {
    expect(FOOTER_LINKS.marketplace).toBeDefined();
    expect(FOOTER_LINKS.support).toBeDefined();
    expect(FOOTER_LINKS.legal).toBeDefined();
    expect(FOOTER_LINKS.vendor).toBeDefined();
  });

  it("all footer links have href and label", () => {
    Object.values(FOOTER_LINKS).forEach((section) => {
      section.forEach((link) => {
        expect(link.href).toBeTruthy();
        expect(link.label).toBeTruthy();
      });
    });
  });
});

describe("Business Constants", () => {
  it("commission rate is a valid percentage", () => {
    expect(DEFAULT_COMMISSION_RATE).toBeGreaterThan(0);
    expect(DEFAULT_COMMISSION_RATE).toBeLessThanOrEqual(100);
  });
});
