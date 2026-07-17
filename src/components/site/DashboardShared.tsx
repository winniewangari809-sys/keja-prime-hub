import { Link } from "@tanstack/react-router";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppRole } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const roleColors: Record<AppRole, { bg: string; text: string; badge: string }> = {
  buyer: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-300", badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200" },
  tenant: { bg: "bg-cyan-50 dark:bg-cyan-900/20", text: "text-cyan-700 dark:text-cyan-300", badge: "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-200" },
  seller: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-700 dark:text-purple-300", badge: "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200" },
  landlord: { bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-700 dark:text-green-300", badge: "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200" },
  agent: { bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-700 dark:text-orange-300", badge: "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200" },
  airbnb: { bg: "bg-pink-50 dark:bg-pink-900/20", text: "text-pink-700 dark:text-pink-300", badge: "bg-pink-100 dark:bg-pink-900/40 text-pink-800 dark:text-pink-200" },
  commercial: { bg: "bg-indigo-50 dark:bg-indigo-900/20", text: "text-indigo-700 dark:text-indigo-300", badge: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200" },
  hq: { bg: "bg-gray-50 dark:bg-gray-900/20", text: "text-gray-700 dark:text-gray-300", badge: "bg-gray-100 dark:bg-gray-900/40 text-gray-800 dark:text-gray-200" },
  admin: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-300", badge: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200" },
};

const roleLabels: Record<AppRole, string> = {
  buyer: "Buyer",
  tenant: "Tenant",
  seller: "Seller",
  landlord: "Landlord",
  agent: "Agent",
  airbnb: "Airbnb Host",
  commercial: "Commercial",
  hq: "HQ",
  admin: "Admin",
};

interface RoleBadgeProps {
  role: AppRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const colors = roleColors[role];
  return (
    <span className={cn("px-3 py-1 rounded-full text-sm font-semibold", colors.badge)}>
      {roleLabels[role]}
    </span>
  );
}

interface WelcomeSectionProps {
  firstName: string;
  role: AppRole;
  subtitle?: string;
}

export function WelcomeSection({ firstName, role, subtitle }: WelcomeSectionProps) {
  const colors = roleColors[role];
  return (
    <div className={cn("rounded-lg p-6", colors.bg)}>
      <h1 className={cn("font-display font-bold text-3xl mb-2", colors.text)}>
        Welcome back, {firstName}!
      </h1>
      {subtitle && (
        <p className="text-sm opacity-75 mb-4">{subtitle}</p>
      )}
      <RoleBadge role={role} />
    </div>
  );
}

export interface QuickAction {
  to: string;
  icon: LucideIcon;
  label: string;
  description: string;
}

interface QuickActionGridProps {
  actions: QuickAction[];
}

export function QuickActionGrid({ actions }: QuickActionGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Link
            key={index}
            to={action.to}
            className="group p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:shadow-soft transition-all duration-200 bg-white dark:bg-gray-900"
          >
            <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {action.label}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {action.description}
            </p>
          </Link>
        );
      })}
    </div>
  );
}

export interface StatItem {
  icon: LucideIcon;
  label: string;
  value: string | number;
  delta?: {
    value: number;
    isPositive: boolean;
  };
}

interface StatGridProps {
  stats: StatItem[];
}

export function StatGrid({ stats }: StatGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-soft hover:shadow-elegant transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              {stat.delta && (
                <div className={cn(
                  "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded",
                  stat.delta.isPositive
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive"
                )}>
                  {stat.delta.isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(stat.delta.value)}%
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {stat.label}
            </p>
            <p className="font-display font-bold text-2xl text-gray-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
