import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "@/stores/cart-store";

const mockItem = {
  productId: "prod-1",
  name: "Café Focus ADHD",
  price: 12.9,
  imageUrl: "https://example.com/img.jpg",
  vendorId: "vendor-1",
  vendorName: "Torréfacteur Paris",
};

const mockItem2 = {
  productId: "prod-2",
  name: "Blend HPI Créatif",
  price: 14.5,
  vendorId: "vendor-1",
  vendorName: "Torréfacteur Paris",
};

describe("Cart Store", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  describe("addItem", () => {
    it("adds a new item with default quantity 1", () => {
      useCartStore.getState().addItem(mockItem);
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].productId).toBe("prod-1");
      expect(items[0].quantity).toBe(1);
    });

    it("adds a new item with custom quantity", () => {
      useCartStore.getState().addItem({ ...mockItem, quantity: 3 });
      expect(useCartStore.getState().items[0].quantity).toBe(3);
    });

    it("increments quantity for existing item", () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().addItem(mockItem);
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(2);
    });

    it("adds multiple different items", () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().addItem(mockItem2);
      expect(useCartStore.getState().items).toHaveLength(2);
    });
  });

  describe("removeItem", () => {
    it("removes an item by productId", () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().addItem(mockItem2);
      useCartStore.getState().removeItem("prod-1");
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].productId).toBe("prod-2");
    });

    it("does nothing for non-existent productId", () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().removeItem("nonexistent");
      expect(useCartStore.getState().items).toHaveLength(1);
    });
  });

  describe("updateQuantity", () => {
    it("updates quantity for an existing item", () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().updateQuantity("prod-1", 5);
      expect(useCartStore.getState().items[0].quantity).toBe(5);
    });

    it("removes item when quantity is 0", () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().updateQuantity("prod-1", 0);
      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it("removes item when quantity is negative", () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().updateQuantity("prod-1", -1);
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe("clearCart", () => {
    it("removes all items", () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().addItem(mockItem2);
      useCartStore.getState().clearCart();
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe("getItemCount", () => {
    it("returns 0 for empty cart", () => {
      expect(useCartStore.getState().getItemCount()).toBe(0);
    });

    it("returns total quantity across all items", () => {
      useCartStore.getState().addItem({ ...mockItem, quantity: 2 });
      useCartStore.getState().addItem({ ...mockItem2, quantity: 3 });
      expect(useCartStore.getState().getItemCount()).toBe(5);
    });
  });

  describe("getSubtotal", () => {
    it("returns 0 for empty cart", () => {
      expect(useCartStore.getState().getSubtotal()).toBe(0);
    });

    it("calculates correct subtotal", () => {
      useCartStore.getState().addItem({ ...mockItem, quantity: 2 }); // 12.90 * 2 = 25.80
      useCartStore.getState().addItem({ ...mockItem2, quantity: 1 }); // 14.50 * 1 = 14.50
      const subtotal = useCartStore.getState().getSubtotal();
      expect(subtotal).toBeCloseTo(40.3, 2);
    });
  });

  describe("getVendorId", () => {
    it("returns null for empty cart", () => {
      expect(useCartStore.getState().getVendorId()).toBeNull();
    });

    it("returns vendor id of first item", () => {
      useCartStore.getState().addItem(mockItem);
      expect(useCartStore.getState().getVendorId()).toBe("vendor-1");
    });
  });
});
