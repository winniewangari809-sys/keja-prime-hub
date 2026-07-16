import { createFileRoute } from "@tanstack/react-router";
import { BrowsePage } from "@/components/site/BrowsePage";

export const Route = createFileRoute("/homes-for-sale")({
  head: () => ({ meta: [{ title: "Homes for Sale in Kenya — KejaHub" }, { name: "description", content: "Buy verified homes, townhouses and off-plan properties across Kenya." }] }),
  component: () => (
    <BrowsePage
      category="sale"
      eyebrow="Homes for Sale"
      title="Buy your dream home"
      description="Verified listings from trusted owners, developers and agents."
    />
  ),
});
