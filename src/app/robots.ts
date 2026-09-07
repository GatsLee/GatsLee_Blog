import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/write", "/api", "/login"],
    },
    sitemap: "https://blog.gatslee.com/sitemap.xml",
  };
}
