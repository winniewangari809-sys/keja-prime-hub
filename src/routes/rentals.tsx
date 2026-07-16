import { createFileRoute } from "@tanstack/react-router";
import { BrowsePage, CheckboxRow } from "@/components/site/BrowsePage";
import { FilterGroup } from "@/components/site/FiltersSidebar";

export const Route = createFileRoute("/rentals")({
  head: () => ({ meta: [{ title: "Rentals in Kenya — KejaHub" }, { name: "description", content: "Browse verified rental apartments, houses and townhouses across Kenya." }] }),
  component: () => (
    <BrowsePage
      category="rental"
      eyebrow="Rentals"
      title="Find your next rental home"
      description="Apartments, houses and townhouses across Kenya — verified and updated daily."
      extraFilters={(s, set) => (
        <FilterGroup label="Amenities">
          <CheckboxRow label="Furnished" checked={!!s.furnished} onChange={(v) => set({ ...s, furnished: v })} />
          <CheckboxRow label="Parking" checked={!!s.parking} onChange={(v) => set({ ...s, parking: v })} />
          <CheckboxRow label="Pet friendly" checked={!!s.petFriendly} onChange={(v) => set({ ...s, petFriendly: v })} />
        </FilterGroup>
      )}
      applyExtra={(p, s) => {
        if (s.furnished && !p.furnished) return false;
        if (s.parking && !p.parking) return false;
        if (s.petFriendly && !p.petFriendly) return false;
        return true;
      }}
    />
  ),
});
