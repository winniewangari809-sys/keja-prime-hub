import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/airbnbs")({
  beforeLoad: async () => {
    throw redirect({
      to: "/rentals",
      search: { category: "airbnb" },
    });
  },
});
