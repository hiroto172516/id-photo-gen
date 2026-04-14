import type { MetadataRoute } from "next";
import { publicAppUrl } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/shoot", "/blog", "/terms", "/privacy", "/support", "/social-kit"],
      disallow: ["/api/", "/auth/callback", "/commercial-transactions"],
    },
    sitemap: `${publicAppUrl}/sitemap.xml`,
    host: publicAppUrl,
  };
}
