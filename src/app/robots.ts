import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";
import { isDemo } from "@/lib/demo";

export default function robots(): MetadataRoute.Robots {
  // La démo est fermée aux moteurs de recherche.
  if (isDemo) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/account/",
          "/vendor/dashboard",
          "/vendor/products",
          "/vendor/orders",
          "/vendor/payouts",
          "/checkout/",
          "/cart",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
