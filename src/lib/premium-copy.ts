import type { Property } from "./mock-data";

export const roomCopy: Record<string, { title: string; body: string; emoji: string }> = {
  bedroom:  { emoji: "🛏", title: "Master Bedroom",  body: "A peaceful space to rest, recharge, and dream big after a long day." },
  kitchen:  { emoji: "🍳", title: "Kitchen",         body: "The heart of the home where delicious meals and family memories are made." },
  living:   { emoji: "🛋", title: "Living Area",     body: "A welcoming space perfect for relaxing and spending quality time." },
  bathroom: { emoji: "🛁", title: "Bathroom",        body: "Designed for comfort and convenience to start and end your day refreshed." },
  balcony:  { emoji: "🌇", title: "Balcony",         body: "Enjoy fresh air and peaceful moments with beautiful views." },
  parking:  { emoji: "🚗", title: "Parking",         body: "Secure, hassle-free parking so you can arrive home and unwind." },
};

/** 0–100 quality/appeal score based on the fields present on a listing. */
export function appealScore(p: Property) {
  let s = 30;
  if (p.images.length >= 4) s += 15;
  if (p.images.length >= 8) s += 5;
  if (p.video) s += 15;
  if (p.verified) s += 10;
  if (p.verificationTier === "gold") s += 5;
  if (p.verificationTier === "platinum") s += 10;
  if (p.transparency) s += 8;
  if (p.neighborhood?.scores) s += 5;
  if (p.amenities && p.amenities.length >= 5) s += 5;
  return Math.min(100, s);
}

/** Deterministic pseudo-random match % seeded from the property id. */
export function matchPercent(p: Property) {
  const seed = p.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return 72 + (seed * 7) % 27; // 72–98
}

export type Demand = "Low" | "Medium" | "High";
export function demandLevel(p: Property): Demand {
  const seed = (p.id.charCodeAt(0) + (p.featured ? 3 : 0) + (p.video ? 2 : 0)) % 6;
  if (p.featured || seed >= 4) return "High";
  if (seed >= 2) return "Medium";
  return "Low";
}

/** 0–5 water reliability score. */
export function waterReliability(p: Property) {
  const seed = p.id.charCodeAt(0) % 5;
  const bonus = p.features.some(f => /borehole|tank|water/i.test(f)) ? 2 : 0;
  return Math.min(5, 2 + (seed % 3) + bonus);
}

export function completeness(p: Property) {
  const checks = [
    !!p.images[0], p.images.length >= 4, !!p.video, !!p.verified,
    !!p.transparency, !!p.neighborhood, !!p.description && p.description.length > 80,
    !!p.features?.length,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function coachTips(p: Property): string[] {
  const tips: string[] = [];
  if (!p.video) tips.push("Add a short video tour — listings with video get 5× more views.");
  if (p.images.length < 6) tips.push("Add more photos (kitchen, bathroom, balcony) to reach 6+ images.");
  if (!p.verified) tips.push("Get verified to unlock the Trusted Seller badge and priority exposure.");
  if (!p.transparency) tips.push("Add cost transparency (water, power, deposit) — buyers trust it more.");
  if (p.description.length < 120) tips.push("Write a longer, warmer description — tell the story of the home.");
  return tips.slice(0, 3);
}
