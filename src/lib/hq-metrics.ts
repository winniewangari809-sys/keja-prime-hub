import { properties } from "./mock-data";
import { verificationQueue, reportsQueue, messagesQueue, usersDirectory } from "./hq-data";
import { helpRequestsSeed } from "./help-requests";

export function executiveOverview() {
  return [
    { label: "Total Users",          value: 8_412,  emoji: "👥" },
    { label: "Buyers / Renters",     value: 5_120,  emoji: "🔍" },
    { label: "Landlords",            value: 1_940,  emoji: "🏠" },
    { label: "Agents",               value: 892,    emoji: "🏢" },
    { label: "Developers",           value: 148,    emoji: "🏗" },
    { label: "Total Properties",     value: properties.length + 12_394, emoji: "🏘" },
    { label: "Active Listings",      value: 9_820,  emoji: "✅" },
    { label: "Airbnb Listings",      value: 1_142,  emoji: "🏨" },
  ];
}

export function todaysActivity() {
  return [
    { label: "New Users",              value: 82,   emoji: "👋" },
    { label: "New Listings",           value: 34,   emoji: "🏠" },
    { label: "New Messages",           value: 218,  emoji: "💬" },
    { label: "Verification Requests",  value: verificationQueue.length + 9, emoji: "✔️" },
    { label: "Help Requests",          value: helpRequestsSeed.filter(h => h.status !== "done").length, emoji: "🆘" },
  ];
}

export function priorityCenter() {
  const help = helpRequestsSeed.filter(h => h.status === "new").length;
  return [
    { label: "Pending Verifications",  count: verificationQueue.length + 9, urgency: "high"   as const, to: "/hq/verifications" },
    { label: "Listing Help Requests",  count: help,                          urgency: "high"   as const, to: "/hq/listing-help" },
    { label: "Reported Listings",      count: reportsQueue.length,           urgency: "medium" as const, to: "/hq/reports" },
    { label: "Reported Users",         count: 1,                             urgency: "medium" as const, to: "/hq/users" },
    { label: "Awaiting Approval",      count: 7,                             urgency: "low"    as const, to: "/hq/listings" },
  ];
}

export function businessIntelligence() {
  return [
    { label: "Most Viewed Property",   value: "Luxury Penthouse — Kilimani",  emoji: "👀" },
    { label: "Most Active Agent",      value: "Amina Wanjiku · 14 listings",  emoji: "🏆" },
    { label: "Most Popular Town",      value: "Ruiru",                        emoji: "📍" },
    { label: "Most Popular County",    value: "Nairobi",                      emoji: "🗺" },
    { label: "Most Popular Type",      value: "2 Bedroom",                    emoji: "🏠" },
    { label: "Top Price Range",        value: "KSh 25k — 45k / mo",           emoji: "💰" },
  ];
}

export function systemHealth() {
  return [
    { label: "Authentication", status: "online" as const, note: "All flows healthy" },
    { label: "Database",       status: "online" as const, note: "Reads < 40ms"      },
    { label: "Messaging",      status: "online" as const, note: "Delivery on time"  },
    { label: "Notifications",  status: "online" as const, note: "Queue clear"       },
    { label: "Storage / CDN",  status: "online" as const, note: "99.9% uptime"      },
  ];
}

export { usersDirectory, messagesQueue };
