import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { cn } from "@/lib/utils";

interface HQPageProps {
  title: string;
  description?: string;
  backTo?: string;
  children: React.ReactNode;
  className?: string;
}

export function HQPage({
  title,
  description,
  backTo = "/dashboard/admin",
  children,
  className,
}: HQPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader
        eyebrow="Admin Dashboard"
        title={title}
        description={description}
      />

      <div className={cn("container-app py-8", className)}>
        <Link
          to={backTo}
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-soft p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
