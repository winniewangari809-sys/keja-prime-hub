import { Link } from "@tanstack/react-router";
import { type LucideIcon } from "lucide-react";
import { useCountUp } from "@/hooks/use-count-up";
import { cn } from "@/lib/utils";
import type { AppRole } from "@/hooks/use-auth";

const roleBadgeClass: Record<AppRole, string> = {
  buyer: "role-badge-buyer",
  tenant: "role-badge-tenant",
  seller: "role-badge-seller",
  landlord: "role-badge-landlord",
  agent: "role-badge-agent",
  hq: "role-badge-hq",
  admin: "role-badge-admin",
};

const roleLabel: Record<AppRole, string> = {
  buyer: "Buyer",
  tenant: "Tenant",
  seller: "Seller",
  landlord: "Landlord",
  agent: "Agent",
  hq: "HQ",
  admin: "Admin",
};

export function RoleBadge({ role }: { role: AppRole }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider", roleBadgeClass[role])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {roleLabel[role]}
    </span>
  );
}

export function WelcomeSection({ firstName, role, subtitle }: { firstName: string; role: AppRole; subtitle: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl md:text-4xl font-bold">
            Welcome back, {firstName}
          </h1>
          <RoleBadge role={role} />
        </div>
        <p className="mt-1.5 text-sm md:text-base text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

export interface QuickAction {
  to?: string;
  icon: LucideIcon;
  label: string;
  desc?: string;
  onClick?: () => void;
  accent?: string;
}

export function QuickActionCard({ action, index = 0 }: { action: QuickAction; index?: number }) {
  const Icon = action.icon;
  const accent = action.accent ?? "text-primary";
  const inner = (
    <div className="group h-full rounded-2xl border border-border bg-card p-5 hover-lift animate-fade-up" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="flex items-center gap-3">
        <div className={cn("grid h-11 w-11 place-items-center rounded-xl bg-primary/10", accent)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{action.label}</p>
          {action.desc && <p className="text-xs text-muted-foreground truncate">{action.desc}</p>}
        </div>
      </div>
    </div>
  );

  if (action.to) {
    return <Link to={action.to as any} className="block h-full">{inner}</Link>;
  }
  return <button onClick={action.onClick} className="block h-full w-full text-left">{inner}</button>;
}

export function QuickActionGrid({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      {actions.map((a, i) => <QuickActionCard key={a.label} action={a} index={i} />)}
    </div>
  );
}

export interface StatItem {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  delta?: string;
  tone?: "primary" | "success" | "warning";
}

export function AnimatedStatCard({ stat, index = 0 }: { stat: StatItem; index?: number }) {
  const count = useCountUp(stat.value);
  const Icon = stat.icon;
  const toneClass = stat.tone === "success" ? "text-success" : stat.tone === "warning" ? "text-warning" : "text-primary";
  return (
    <div className="rounded-2xl border border-border bg-card p-5 hover-lift animate-fade-up" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="flex items-center justify-between">
        <div className={cn("grid h-10 w-10 place-items-center rounded-lg bg-primary/10", toneClass)}>
          <Icon className="h-5 w-5" />
        </div>
        {stat.delta && <span className="text-xs font-semibold text-success">{stat.delta}</span>}
      </div>
      <p className="mt-4 font-display text-3xl font-bold tabular-nums stat-glow">
        {stat.prefix}{count.toLocaleString()}{stat.suffix}
      </p>
      <p className="text-sm text-muted-foreground">{stat.label}</p>
    </div>
  );
}

export function StatGrid({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {stats.map((s, i) => <AnimatedStatCard key={s.label} stat={s} index={i} />)}
    </div>
  );
}
