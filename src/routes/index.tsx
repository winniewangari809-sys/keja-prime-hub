import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-foreground">KejaHub</h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Your trusted platform for finding and listing properties in Kenya.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/rentals">
            <Button size="lg">Browse Properties</Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg">Sign In</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
