import type { MetadataRoute } from "next";
import { publicAppUrl } from "@/lib/brand";

const lastModified = new Date("2026-03-17T00:00:00+09:00");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: publicAppUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${publicAppUrl}/shoot`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${publicAppUrl}/blog/how-to-take-id-photo-with-smartphone`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${publicAppUrl}/social-kit`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${publicAppUrl}/terms`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${publicAppUrl}/privacy`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
