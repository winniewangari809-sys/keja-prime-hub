import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn(
      "gradient-primary text-white py-12 md:py-16",
      className
    )}>
      <div className="container-app">
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-wider opacity-90 mb-2">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display font-bold text-4xl md:text-5xl mb-4">
          {title}
        </h1>
        {description && (
          <p className="text-lg opacity-90 max-w-2xl">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
