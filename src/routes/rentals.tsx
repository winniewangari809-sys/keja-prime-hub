import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/rentals")({
  component: RentalsPage,
});

function RentalsPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold">Rentals</h1>
      <p className="mt-4 text-muted-foreground">Browse available rental properties.</p>
    </div>
  );
}
