import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar, Footer } from "@/components/site";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        title: "KejaHub — Kenya's Property Concierge Platform",
      },
      {
        name: "description",
        content:
          "Discover and list properties in Kenya with KejaHub's trusted concierge service. Find your perfect home, investment, or rental property.",
      },
    ],
  }),
  component: () => (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <Toaster />
      </div>
    </ThemeProvider>
  ),
});
