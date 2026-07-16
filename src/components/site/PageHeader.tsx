export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <section className="gradient-hero border-b border-border">
      <div className="container-app py-12 md:py-16">
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">{eyebrow}</p>}
        <h1 className="font-display text-3xl md:text-5xl font-bold text-balance max-w-3xl">{title}</h1>
        {description && <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-2xl">{description}</p>}
      </div>
    </section>
  );
}
