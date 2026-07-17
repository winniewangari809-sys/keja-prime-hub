import { createFileRoute } from "@tanstack/react-router";
import { properties } from "@/lib/mock-data";

export const Route = createFileRoute("/sitemap.xml")({
  beforeLoad: async ({ location }) => {
    // This is handled by the response below
    return;
  },
});

export function SitemapXml() {
  const baseUrl = "https://kejahub.com";

  const staticPages = [
    { url: "/", lastmod: new Date().toISOString().split("T")[0], priority: "1.0" },
    { url: "/rentals", lastmod: new Date().toISOString().split("T")[0], priority: "0.9" },
    { url: "/concierge", lastmod: new Date().toISOString().split("T")[0], priority: "0.8" },
    { url: "/about", lastmod: new Date().toISOString().split("T")[0], priority: "0.7" },
    { url: "/contact", lastmod: new Date().toISOString().split("T")[0], priority: "0.7" },
    { url: "/login", lastmod: new Date().toISOString().split("T")[0], priority: "0.6" },
    { url: "/signup", lastmod: new Date().toISOString().split("T")[0], priority: "0.6" },
  ];

  const propertyPages = properties.map((p) => ({
    url: `/property/${p.slug}`,
    lastmod: new Date().toISOString().split("T")[0],
    priority: "0.8",
  }));

  const urls = [...staticPages, ...propertyPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <priority>${page.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
