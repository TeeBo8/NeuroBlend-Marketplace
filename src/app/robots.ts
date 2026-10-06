import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
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
