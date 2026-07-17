import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { useTheme } from "@/hooks/use-theme";

export const Route = createFileRoute("__root")({
  component: RootComponent,
});

function RootComponent() {
  const { theme } = useTheme();

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  );
}
