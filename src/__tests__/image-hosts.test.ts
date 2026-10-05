import { describe, it, expect } from "vitest";
import { isAllowedImageUrl } from "@/lib/image-hosts";

describe("isAllowedImageUrl", () => {
  it("accepte les deux hôtes d'UploadThing", () => {
    expect(isAllowedImageUrl("https://utfs.io/f/abc.jpg")).toBe(true);
    expect(isAllowedImageUrl("https://monappli.ufs.sh/f/abc.jpg")).toBe(true);
  });

  it("accepte les images statiques du site", () => {
    expect(isAllowedImageUrl("/images/products/coffee-pour.jpg")).toBe(true);
    expect(isAllowedImageUrl("//exemple.com/images/photo.jpg")).toBe(false);
  });

  it("refuse les autres hôtes, même ressemblants", () => {
    expect(isAllowedImageUrl("https://exemple.com/photo.jpg")).toBe(false);
    expect(isAllowedImageUrl("https://utfs.io.exemple.com/photo.jpg")).toBe(false);
    expect(isAllowedImageUrl("https://fauxufs.sh/photo.jpg")).toBe(false);
    expect(isAllowedImageUrl("https://ufs.sh.exemple.com/photo.jpg")).toBe(false);
  });

  it("refuse ce qui n'est pas du https", () => {
    expect(isAllowedImageUrl("http://utfs.io/f/abc.jpg")).toBe(false);
    expect(isAllowedImageUrl("javascript:alert(1)")).toBe(false);
    expect(isAllowedImageUrl("pas une url")).toBe(false);
  });
});
