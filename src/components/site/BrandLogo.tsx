import { Link } from "@tanstack/react-router";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <Link to="/" className={cn("flex items-center gap-2 hover:opacity-80 transition-opacity", className)}>
      <div className="gradient-primary rounded-lg p-2 flex items-center justify-center">
        <Home className="w-5 h-5 text-white" />
      </div>
      <span className="font-display font-bold text-xl text-gray-900 dark:text-white">KejaHub</span>
    </Link>
  );
}
