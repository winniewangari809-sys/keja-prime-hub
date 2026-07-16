import { BarChart3, Eye, Heart, Calendar, FileText, CheckCircle, Home, TrendingUp, Award } from "lucide-react";

const performanceStats = [
  { icon: Heart, label: "Properties Saved", value: 47, delta: "+8 this week" },
  { icon: Calendar, label: "Viewing Requests", value: 12, delta: "+3 this week" },
  { icon: Calendar, label: "Scheduled Viewings", value: 8, delta: "+2 this week" },
  { icon: FileText, label: "Offers Received", value: 5, delta: "+1 this week" },
  { icon: CheckCircle, label: "Properties Sold", value: 3, delta: "+1 this month" },
  { icon: Home, label: "Properties Rented", value: 7, delta: "+2 this month" },
];

const topListings = [
  { title: "Kilimani 2BR Apartment", views: 1240, saves: 34, rank: 1 },
  { title: "Ruiru Bedsitter", views: 890, saves: 28, rank: 2 },
  { title: "Diani Beach Villa", views: 756, saves: 22, rank: 3 },
];

export function ListingPerformance() {
  return (
    <div className="space-y-6">
      {/* Performance stats */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-xl font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" /> Listing Performance
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {performanceStats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border p-4 hover-lift">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
              {s.delta && <p className="mt-2 text-xs font-semibold text-success">{s.delta}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Listings */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-xl font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" /> Top Performing Listings
        </h3>
        <div className="mt-4 space-y-3">
          {topListings.map((l) => (
            <div key={l.title} className="flex items-center gap-4 rounded-xl border border-border p-4 hover:bg-accent transition-colors">
              <div className={`grid h-10 w-10 place-items-center rounded-full font-bold text-sm shrink-0 ${
                l.rank === 1 ? "bg-warning/15 text-warning" : l.rank === 2 ? "bg-secondary text-muted-foreground" : "bg-orange-700/15 text-orange-700"
              }`}>
                {l.rank}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{l.title}</p>
                <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {l.views} views</span>
                  <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {l.saves} saves</span>
                </div>
              </div>
              <Award className="h-5 w-5 text-warning shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Most Viewed & Most Saved */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-lg font-semibold flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" /> Most Viewed Listings
          </h3>
          <div className="mt-4 space-y-2">
            {topListings.map((l) => (
              <div key={l.title} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                <span className="font-medium truncate">{l.title}</span>
                <span className="font-semibold text-primary shrink-0 ml-3">{l.views} views</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-lg font-semibold flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" /> Most Saved Listings
          </h3>
          <div className="mt-4 space-y-2">
            {topListings.map((l) => (
              <div key={l.title} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                <span className="font-medium truncate">{l.title}</span>
                <span className="font-semibold text-primary shrink-0 ml-3">{l.saves} saves</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
