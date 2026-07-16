export function useGreeting(now: Date = new Date()) {
  const h = now.getHours();
  if (h < 12) return { label: "Good morning", emoji: "☀️" };
  if (h < 17) return { label: "Good afternoon", emoji: "🌤" };
  return { label: "Good evening", emoji: "🌙" };
}
