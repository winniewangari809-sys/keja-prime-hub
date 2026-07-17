import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/homes-for-sale")({
  beforeLoad: async () => {
    throw redirect({
      to: "/rentals",
      search: { category: "sale" },
    });
  },
});
