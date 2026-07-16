import { createFileRoute } from "@tanstack/react-router";
import { BrowsePage } from "@/components/site/BrowsePage";

export const Route = createFileRoute("/airbnbs")({
  head: () => ({ meta: [{ title: "Airbnbs & Short Stays in Kenya — KejaHub" }, { name: "description", content: "Browse Airbnb rentals, holiday homes, and short stays across Kenya." }] }),
  component: () => (
    <BrowsePage
      category="airbnb"
      eyebrow="Airbnbs"
      title="Short stays & holiday homes"
      description="Book beachfront villas, city lofts, and everything in between."
    />
  ),
});
