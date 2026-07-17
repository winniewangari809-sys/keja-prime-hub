import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/commercial-property")({
  beforeLoad: async () => {
    throw redirect({
      to: "/rentals",
      search: { category: "commercial" },
    });
  },
});
