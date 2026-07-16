import { createFileRoute } from "@tanstack/react-router";
import { BrowsePage } from "@/components/site/BrowsePage";

export const Route = createFileRoute("/commercial-property")({
  head: () => ({ meta: [{ title: "Commercial Property in Kenya — KejaHub" }, { name: "description", content: "Browse offices, shops, warehouses and business spaces across Kenya." }] }),
  component: () => (
    <BrowsePage
      category="commercial"
      eyebrow="Commercial"
      title="Offices, shops & business spaces"
      description="Prime commercial property for your business — rent or buy."
    />
  ),
});
