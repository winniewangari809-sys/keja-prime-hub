import type { Property } from "./mock-data";

export type LifestyleTag =
  | "Student Friendly" | "Work Friendly" | "Family Friendly"
  | "Couple Friendly" | "Traveler Friendly" | "Commuter Friendly";

const universities = ["JKUAT", "Kenyatta University", "KU", "MKU", "USIU", "Strathmore", "UoN"];
const businessAreas = ["Westlands", "Upper Hill", "Kilimani", "CBD", "Tatu City"];

export function whyLocation(p: Property): { icon: string; text: string }[] {
  const items: { icon: string; text: string }[] = [];
  const area = p.location.split(",")[0].trim();
  const seed = p.id.charCodeAt(0);
  items.push({ icon: "🎓", text: `${(seed % 6) + 3} minutes from ${universities[seed % universities.length]}` });
  items.push({ icon: "🏥", text: `${(seed % 5) + 4} minutes to nearest hospital` });
  items.push({ icon: "🛒", text: `Walking distance to Naivas / Carrefour supermarket` });
  items.push({ icon: "🛣️", text: `${(seed % 4) + 2} minutes to the main road` });
  items.push({ icon: "💼", text: `Easy commute to ${businessAreas[seed % businessAreas.length]}` });
  items.push({ icon: "🚌", text: `Matatu stage minutes from ${area}` });
  return items;
}

export function lifestyleTags(p: Property): LifestyleTag[] {
  const tags = new Set<LifestyleTag>();
  const seed = p.id.charCodeAt(0);
  if (p.category === "airbnb") { tags.add("Traveler Friendly"); tags.add("Couple Friendly"); }
  if (p.bedrooms && p.bedrooms >= 3) tags.add("Family Friendly");
  if (p.category === "rental" && (p.bedrooms === 0 || (p.bedrooms ?? 0) <= 1)) tags.add("Student Friendly");
  if (p.amenities?.some(a => /wifi|workspace|internet/i.test(a)) || p.features.some(f => /fibre|internet/i.test(f))) tags.add("Work Friendly");
  if (seed % 2 === 0) tags.add("Commuter Friendly");
  return Array.from(tags);
}
