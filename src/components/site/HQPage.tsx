import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "./PageHeader";
import type { ReactNode } from "react";

export function HQPage({ eyebrow, title, description, children }: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <>
      <PageHeader eyebrow={eyebrow ?? "🏢 KejaHub HQ"} title={title} description={description} />
      <section className="container-app py-8">
        <Link to="/dashboard/admin" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to HQ
        </Link>
        {children}
      </section>
    </>
  );
}

export function EmptyState({ label = "No data available yet." }: { label?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-12 text-center">
      <p className="text-4xl">🗂</p>
      <p className="mt-3 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
