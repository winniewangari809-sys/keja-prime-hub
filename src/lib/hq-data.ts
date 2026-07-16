export type ActivityKind = "listing" | "message" | "featured" | "verification" | "concierge" | "report";

export const activityFeedSeed: { kind: ActivityKind; text: string; when: string }[] = [
  { kind: "listing",      text: "New listing: 2BR Apartment in Ruiru added by James O.", when: "just now" },
  { kind: "message",      text: "Peter M. messaged the owner of Chic Loft — Westlands", when: "1 min ago" },
  { kind: "verification", text: "Grace M. submitted ID verification (Silver)", when: "3 min ago" },
  { kind: "concierge",    text: "New Assisted Viewing request — Diani (KSh 2,999)", when: "8 min ago" },
  { kind: "featured",     text: "Modern 2BR Kilimani was featured (7 days)", when: "12 min ago" },
  { kind: "report",       text: "Report filed on Warehouse — Industrial Area", when: "22 min ago" },
];

export const achievements = [
  { icon: "🏆", label: "First 100 Listings",  unlocked: true  },
  { icon: "🏆", label: "First 50 Agents",     unlocked: true  },
  { icon: "🏆", label: "First KSh 10K Revenue", unlocked: true  },
  { icon: "🏆", label: "First 1,000 Users",   unlocked: false },
  { icon: "🌟", label: "100 Verified Properties", unlocked: false },
];

export const heatMap = [
  { area: "Ruiru",     score: 92, trend: "up"   as const },
  { area: "Juja",      score: 88, trend: "up"   as const },
  { area: "Thika",     score: 81, trend: "flat" as const },
  { area: "Kilimani",  score: 78, trend: "up"   as const },
  { area: "Nairobi CBD", score: 74, trend: "down" as const },
  { area: "Nakuru",    score: 69, trend: "up"   as const },
];

export const assistantTips = [
  "2-bedroom apartments in Ruiru are trending this week — encourage owners in that area to list.",
  "Listings with videos receive 3× more inquiries. Nudge sellers to upload a video tour.",
  "Verified listings convert 2.4× better. Approve pending Silver verifications first.",
  "Airbnb bookings peak Thu–Sat. Feature Diani properties this Wednesday.",
  "Concierge revenue grew 34% this month — consider promoting the Premium Bundle on the homepage.",
];

export const goals = [
  { label: "Monthly revenue", current: 11_600_000, target: 15_000_000, format: "kes" as const },
  { label: "New listings",    current: 412,        target: 600,        format: "num" as const },
  { label: "New users",       current: 2_140,      target: 3_500,      format: "num" as const },
];

export const verificationQueue = [
  { id: "v1", name: "Grace Muthoni",   type: "ID Verification",       tier: "silver",   submitted: "2h ago" },
  { id: "v2", name: "Kevin Kiprono",   type: "Property Verification", tier: "gold",     submitted: "5h ago" },
  { id: "v3", name: "Amina Wanjiku",   type: "Business KYC",          tier: "platinum", submitted: "1d ago" },
];

export const conciergeQueue = [
  { id: "c1", user: "Peter M.",  service: "Property Match",    budget: "KSh 30,000/mo", area: "Ruiru",   posted: "20 min ago" },
  { id: "c2", user: "Faith N.",  service: "Assisted Viewing",  budget: "KSh 15,000/nt", area: "Diani",   posted: "1h ago" },
  { id: "c3", user: "Brian O.",  service: "Premium Bundle",    budget: "KSh 150,000/mo", area: "Westlands", posted: "3h ago" },
];

export const reportsQueue = [
  { id: "r1", listing: "Warehouse — Industrial Area", reason: "Suspicious pricing", by: "Jane K.", when: "22 min ago" },
  { id: "r2", listing: "Cheap plot Kitengela",         reason: "Possible scam",       by: "Alex M.", when: "2h ago" },
];

export const messagesQueue = [
  { id: "m1", from: "Peter M.",  about: "Chic Downtown Loft — Westlands", preview: "Is the loft available next weekend?", when: "1 min ago", unread: true  },
  { id: "m2", from: "Anne W.",   about: "5BR Family Home — Runda",         preview: "Can we schedule a viewing on Saturday?", when: "18 min ago", unread: true  },
  { id: "m3", from: "David K.",  about: "Studio Apartment — Ruiru",         preview: "Is it still available for October?",   when: "2h ago",     unread: false },
];

export type NotificationRole = "buyer" | "landlord" | "agent" | "hq";

export type Notification = {
  id: string;
  role: NotificationRole;
  kind: "message" | "verification" | "viewing" | "payment" | "alert" | "announcement";
  title: string;
  body: string;
  when: string;
  unread: boolean;
};

export const notifications: Notification[] = [
  { id: "n1", role: "buyer",    kind: "message",      title: "New message from Peter M.",       body: "About Chic Downtown Loft — Westlands",   when: "1 min ago",  unread: true  },
  { id: "n2", role: "landlord", kind: "verification", title: "Silver verification approved 🎉",  body: "Your ID has been verified.",              when: "2h ago",     unread: true  },
  { id: "n3", role: "buyer",    kind: "viewing",      title: "Viewing confirmed",                body: "Saturday 10:00 — 5BR Runda",              when: "5h ago",     unread: false },
  { id: "n4", role: "landlord", kind: "payment",      title: "Featured listing purchase confirmed", body: "Modern 2BR Kilimani featured 7 days.", when: "Yesterday", unread: false },
  { id: "n5", role: "buyer",    kind: "alert",        title: "New match: 2BR in Ruiru",           body: "Fits your saved search (< KSh 30K).",    when: "Yesterday", unread: false },
  { id: "n6", role: "hq",       kind: "announcement", title: "New: KejaHub Concierge is live",    body: "Let our team handle your search.",        when: "2d ago",     unread: false },
  { id: "n7", role: "agent",    kind: "message",      title: "New lead: Kilimani 2BR",            body: "Enquiry from Faith N.",                   when: "35 min ago", unread: true  },
  { id: "n8", role: "hq",       kind: "verification", title: "3 verifications waiting",           body: "Silver + Gold applicants ready to review.", when: "1h ago",   unread: true  },
];


export const usersDirectory = [
  { id: "u1", name: "Amina Wanjiku", role: "Agent",     tier: "platinum", joined: "Mar 2025", listings: 14 },
  { id: "u2", name: "James Otieno",  role: "Owner",     tier: "gold",     joined: "May 2025", listings: 6  },
  { id: "u3", name: "Grace Muthoni", role: "Host",      tier: "silver",   joined: "Jun 2025", listings: 4  },
  { id: "u4", name: "Kevin Kiprono", role: "Developer", tier: "silver",   joined: "Feb 2025", listings: 9  },
  { id: "u5", name: "Peter M.",      role: "Seeker",    tier: "bronze",   joined: "Jul 2025", listings: 0  },
];

export const securityEvents = [
  { id: "s1", kind: "Failed login",       who: "user_2481", where: "Nairobi",  when: "4 min ago", severity: "low"    },
  { id: "s2", kind: "New device sign-in", who: "kevin@…",   where: "Eldoret",  when: "1h ago",    severity: "medium" },
  { id: "s3", kind: "Suspicious listing", who: "listing_98", where: "—",       when: "2h ago",    severity: "high"   },
];

export const revenueVault = {
  today:  384_000,
  week:  2_140_000,
  month: 11_600_000,
  year:  87_400_000,
  sources: [
    { label: "Featured listings",   value: 4_200_000 },
    { label: "Agent subscriptions", value: 3_100_000 },
    { label: "Verification fees",   value: 1_900_000 },
    { label: "Concierge services",  value: 1_450_000 },
    { label: "Advertising",         value:   980_000 },
    { label: "Future commissions",  value:   420_000 },
  ],
};

export const marketplacePulse = [
  { key: "activeUsers",    label: "Active users now", value: 342,  emoji: "🔥" },
  { key: "listings",       label: "Active listings",  value: 12_406, emoji: "🏠" },
  { key: "featured",       label: "Featured listings",value: 138,  emoji: "⭐" },
  { key: "messages",       label: "New messages",     value: 84,   emoji: "📩" },
  { key: "verifications",  label: "Verification requests", value: 18, emoji: "✅" },
  { key: "searches",       label: "Searches today",   value: 5_812, emoji: "📈" },
];
