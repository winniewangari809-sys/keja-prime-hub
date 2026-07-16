export type PropertyCategory =
  | "rental"
  | "airbnb"
  | "sale"
  | "land"
  | "commercial";

export interface PropertyVideo {
  url: string;
  thumbnail?: string;
  duration: string; // e.g. "1:24"
}

export type PropertyStatus = "available" | "pending" | "reserved" | "sold" | "rented";
export type PropertyType =
  | "Bedsitter" | "Single Room" | "Studio"
  | "1 Bedroom" | "2 Bedroom" | "3 Bedroom" | "4+ Bedroom"
  | "Bungalow" | "Townhouse" | "Villa" | "Penthouse" | "Maisonette"
  | "Airbnb" | "Land" | "Farm" | "Office" | "Warehouse" | "Shop";
export type VerificationTier = "bronze" | "silver" | "gold" | "platinum";
export type AirbnbType = "Entire Place" | "Private Room" | "Shared Room" | "Studio";
export type AirbnbBadge = "Super Host" | "Couple Friendly" | "Work Friendly" | "Traveler Friendly" | "KejaHub Recommended" | "Family Friendly";

export interface PropertyUnit {
  type: string;
  quantity: number;
  available: number;
  price: number;
  amenities?: string[];
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  category: PropertyCategory;
  propertyType?: PropertyType;
  price: number;
  priceUnit: "month" | "night" | "total" | "acre";
  location: string;
  county: string;
  bedrooms?: number;
  bathrooms?: number;
  size?: string;
  images: string[];
  video?: PropertyVideo;
  featured?: boolean;
  verified?: boolean;
  verificationTier?: VerificationTier;
  status?: PropertyStatus;
  description: string;
  features: string[];
  owner: {
    name: string;
    type: "Agent" | "Owner" | "Developer" | "Host" | "Property Manager";
    verified: boolean;
    verificationTier?: VerificationTier;
    phone: string;
    avatar: string;
    responseTime?: string;
    activeListings?: number;
  };
  amenities?: string[];
  guests?: number;
  checkIn?: string;
  checkOut?: string;
  landType?: string;
  acreage?: string;
  roadAccess?: string;
  soilType?: string;
  waterAvailable?: boolean;
  electricityAvailable?: boolean;
  officeSpace?: string;
  warehouseSpace?: string;
  parkingCapacity?: number;
  saleOrLease?: "Sale" | "Lease";
  furnished?: boolean;
  parking?: boolean;
  petFriendly?: boolean;
  transparency?: {
    water?: { type: "Included" | "Metered"; avgMonthly?: number };
    electricity?: { type: "Prepaid" | "Postpaid"; avgMonthly?: number };
    deposit?: { amount: number; refundable: boolean; conditions?: string };
    charges?: { garbage?: number; parking?: number; security?: number; service?: number };
  };
  neighborhood?: {
    scores?: { security: number; quietness: number; convenience: number; family: number; overall: number };
    nearby?: { label: string; name: string; minutes: number }[];
  };
  units?: PropertyUnit[];
  airbnbType?: AirbnbType;
  airbnbBadges?: AirbnbBadge[];
  amenityGroups?: {
    essentials?: string[];
    building?: string[];
    lifestyle?: string[];
    business?: string[];
    family?: string[];
  };
  createdAt: string;
}

export const statusMeta: Record<PropertyStatus, { label: string; color: string; dot: string }> = {
  available: { label: "Available", color: "bg-success/15 text-success", dot: "bg-success" },
  pending:   { label: "Pending Booking", color: "bg-warning/15 text-warning-foreground", dot: "bg-warning" },
  reserved:  { label: "Reserved", color: "bg-orange-500/15 text-orange-600", dot: "bg-orange-500" },
  sold:      { label: "Sold", color: "bg-destructive/15 text-destructive", dot: "bg-destructive" },
  rented:    { label: "Rented", color: "bg-destructive/15 text-destructive", dot: "bg-destructive" },
};

export const tierMeta: Record<VerificationTier, { label: string; color: string; ring: string }> = {
  bronze:   { label: "Bronze · Phone Verified", color: "text-amber-800 bg-amber-100", ring: "ring-amber-400" },
  silver:   { label: "Silver · ID Verified", color: "text-slate-800 bg-slate-200", ring: "ring-slate-400" },
  gold:     { label: "Gold · Property Verified", color: "text-yellow-900 bg-yellow-100", ring: "ring-yellow-400" },
  platinum: { label: "Platinum · Fully Verified", color: "text-primary bg-primary/10", ring: "ring-primary" },
};

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const owners = [
  { name: "Amina Wanjiku", type: "Agent" as const, verified: true, verificationTier: "platinum" as const, phone: "+254712345678", avatar: img("photo-1494790108377-be9c29b29330", 200), responseTime: "under 1 hour", activeListings: 14 },
  { name: "James Otieno", type: "Owner" as const, verified: true, verificationTier: "gold" as const, phone: "+254722334455", avatar: img("photo-1500648767791-00dcc994a43e", 200), responseTime: "within 3 hours", activeListings: 6 },
  { name: "Grace Muthoni", type: "Host" as const, verified: true, verificationTier: "gold" as const, phone: "+254733112233", avatar: img("photo-1438761681033-6461ffad8d80", 200), responseTime: "within 2 hours", activeListings: 4 },
  { name: "Kevin Kiprono", type: "Developer" as const, verified: false, verificationTier: "silver" as const, phone: "+254701998877", avatar: img("photo-1472099645785-5658abf4ff4e", 200), responseTime: "same day", activeListings: 9 },
  { name: "Sarah Njeri", type: "Property Manager" as const, verified: true, verificationTier: "platinum" as const, phone: "+254745667788", avatar: img("photo-1544005313-94ddf0286df2", 200), responseTime: "under 1 hour", activeListings: 22 },
];

export const properties: Property[] = [
  {
    id: "1",
    slug: "modern-2br-apartment-kilimani",
    title: "Modern 2 Bedroom Apartment in Kilimani",
    category: "rental",
    price: 65000,
    priceUnit: "month",
    location: "Kilimani, Nairobi",
    county: "Nairobi",
    bedrooms: 2,
    bathrooms: 2,
    size: "95 sqm",
    images: [
      img("photo-1522708323590-d24dbb6b0267"),
      img("photo-1560448204-e02f11c3d0e2"),
      img("photo-1583847268964-b28dc8f51f92"),
      img("photo-1556909114-f6e7ad7d3136"),
      img("photo-1600607687939-ce8a6c25118c"),
    ],
    video: {
      url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      thumbnail: img("photo-1522708323590-d24dbb6b0267"),
      duration: "0:15",
    },
    featured: true,
    verified: true,
    furnished: true,
    parking: true,
    petFriendly: false,
    description:
      "A beautifully finished 2-bedroom apartment in the heart of Kilimani. Enjoy panoramic city views, a rooftop pool, high-speed fibre and 24/7 security in a well-managed residence.",
    features: ["Rooftop pool", "24/7 security", "Fibre internet", "Backup generator", "Gym access", "Borehole water"],
    owner: owners[0],
    createdAt: "2025-06-10",
  },
  {
    id: "2",
    slug: "beachfront-villa-diani",
    title: "Beachfront Villa with Private Pool — Diani",
    category: "airbnb",
    price: 18500,
    priceUnit: "night",
    location: "Diani Beach, Kwale",
    county: "Kwale",
    bedrooms: 4,
    bathrooms: 3,
    guests: 8,
    size: "220 sqm",
    images: [
      img("photo-1613490493576-7fde63acd811"),
      img("photo-1582268611958-ebfd161ef9cf"),
      img("photo-1615529182904-14819c35db37"),
      img("photo-1600585154340-be6161a56a0c"),
      img("photo-1600566753190-17f0baa2a6c3"),
    ],
    video: {
      url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      thumbnail: img("photo-1613490493576-7fde63acd811"),
      duration: "0:15",
    },
    featured: true,
    verified: true,
    amenities: ["Private pool", "Ocean view", "AC", "Wifi", "Chef on request", "Beach access"],
    description:
      "Wake up to the sound of the Indian Ocean in this stunning 4-bedroom villa. Private pool, tropical gardens and direct beach access make it ideal for family getaways.",
    features: ["Private beach", "Infinity pool", "Housekeeping", "Airport pickup"],
    owner: owners[2],
    createdAt: "2025-06-15",
  },
  {
    id: "3",
    slug: "family-home-runda",
    title: "5 Bedroom Family Home in Runda",
    category: "sale",
    price: 78000000,
    priceUnit: "total",
    location: "Runda, Nairobi",
    county: "Nairobi",
    bedrooms: 5,
    bathrooms: 5,
    size: "450 sqm on 1/2 acre",
    images: [
      img("photo-1600596542815-ffad4c1539a9"),
      img("photo-1600585154526-990dced4db0d"),
      img("photo-1600607687939-ce8a6c25118c"),
      img("photo-1600566753086-00f18fe6ba68"),
    ],
    video: {
      url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      thumbnail: img("photo-1600596542815-ffad4c1539a9"),
      duration: "10:53",
    },
    featured: true,
    verified: true,
    description:
      "Timeless family residence in one of Nairobi's most prestigious neighbourhoods. Mature landscaped gardens, DSQ, and walking distance to top international schools.",
    features: ["1/2 acre plot", "DSQ", "Solar water heating", "Electric fence", "Borehole"],
    owner: owners[3],
    createdAt: "2025-05-20",
  },
  {
    id: "5",
    slug: "office-space-westlands",
    title: "Grade A Office Space — Westlands",
    category: "commercial",
    price: 220000,
    priceUnit: "month",
    location: "Westlands, Nairobi",
    county: "Nairobi",
    size: "320 sqm",
    images: [
      img("photo-1497366216548-37526070297c"),
      img("photo-1497366754035-f200968a6e72"),
      img("photo-1524758631624-e2822e304c36"),
    ],
    featured: true,
    verified: true,
    description:
      "Fully fitted Grade A office on the 12th floor of a landmark Westlands tower. Column-free floorplate, floor-to-ceiling glazing, and secure basement parking.",
    features: ["Fibre ready", "Backup power", "Secure parking", "Reception"],
    owner: owners[4],
    createdAt: "2025-06-25",
  },
  {
    id: "6",
    slug: "studio-apartment-ruiru",
    title: "Cozy Studio Apartment in Ruiru",
    category: "rental",
    price: 18000,
    priceUnit: "month",
    location: "Ruiru, Kiambu",
    county: "Kiambu",
    bedrooms: 0,
    bathrooms: 1,
    size: "38 sqm",
    images: [
      img("photo-1502672260266-1c1ef2d93688"),
      img("photo-1554995207-c18c203602cb"),
      img("photo-1493809842364-78817add7ffb"),
    ],
    verified: true,
    furnished: false,
    parking: true,
    description:
      "Perfect starter home in a gated compound with backup water and CCTV. Close to Thika Superhighway and Ruiru CBD.",
    features: ["Gated compound", "CCTV", "Water tanks", "Ample parking"],
    owner: owners[1],
    createdAt: "2025-07-01",
  },
  {
    id: "7",
    slug: "airbnb-loft-westlands",
    title: "Chic Downtown Loft — Westlands",
    category: "airbnb",
    price: 6500,
    priceUnit: "night",
    location: "Westlands, Nairobi",
    county: "Nairobi",
    bedrooms: 1,
    bathrooms: 1,
    guests: 3,
    images: [
      img("photo-1522708323590-d24dbb6b0267"),
      img("photo-1560448075-bb485b067938"),
      img("photo-1522771739844-6a9f6d5f14af"),
    ],
    verified: true,
    amenities: ["Wifi", "Netflix", "Kitchen", "Workspace", "AC"],
    description: "Modern loft-style apartment steps away from Sarit Centre. Great for business trips and short stays.",
    features: ["Self check-in", "Cleaning included"],
    owner: owners[2],
    createdAt: "2025-06-28",
  },
  {
    id: "8",
    slug: "townhouse-syokimau",
    title: "4 Bed Townhouse in Syokimau",
    category: "sale",
    price: 22500000,
    priceUnit: "total",
    location: "Syokimau, Machakos",
    county: "Machakos",
    bedrooms: 4,
    bathrooms: 3,
    size: "180 sqm",
    images: [
      img("photo-1568605114967-8130f3a36994"),
      img("photo-1600585152915-d208bec867a1"),
      img("photo-1600566753051-6057f0f0b3ba"),
    ],
    verified: true,
    description: "Contemporary townhouse in a secure gated community minutes from JKIA and the SGR terminus.",
    features: ["Gated community", "Clubhouse", "Kids play area", "Backup water"],
    owner: owners[3],
    createdAt: "2025-06-18",
  },
  {
    id: "9",
    slug: "warehouse-industrial-area",
    title: "Warehouse Space — Industrial Area",
    category: "commercial",
    price: 450000,
    priceUnit: "month",
    location: "Industrial Area, Nairobi",
    county: "Nairobi",
    size: "1,200 sqm",
    images: [
      img("photo-1553413077-190dd305871c"),
      img("photo-1586528116311-ad8dd3c8310d"),
    ],
    verified: false,
    description: "Large warehouse with high loading dock and 3-phase power. Ideal for logistics or manufacturing.",
    features: ["Loading dock", "3-phase power", "Truck access"],
    owner: owners[4],
    createdAt: "2025-06-22",
  },
  {
    id: "11",
    slug: "penthouse-kilimani",
    title: "Luxury Penthouse with City Views",
    category: "rental",
    price: 180000,
    priceUnit: "month",
    location: "Kilimani, Nairobi",
    county: "Nairobi",
    bedrooms: 3,
    bathrooms: 3,
    size: "220 sqm",
    images: [
      img("photo-1600585154340-be6161a56a0c"),
      img("photo-1600566753190-17f0baa2a6c3"),
      img("photo-1600607687939-ce8a6c25118c"),
    ],
    video: {
      url: "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
      thumbnail: img("photo-1600585154340-be6161a56a0c"),
      duration: "1:22",
    },
    featured: true,
    verified: true,
    furnished: true,
    parking: true,
    description: "Stunning penthouse with wraparound balcony, private lift access, and skyline views.",
    features: ["Private lift", "Sky terrace", "Smart home", "Concierge"],
    owner: owners[0],
    createdAt: "2025-07-03",
  },
  {
    id: "12",
    slug: "shop-mombasa-cbd",
    title: "Retail Shop in Mombasa CBD",
    category: "commercial",
    price: 85000,
    priceUnit: "month",
    location: "Mombasa CBD, Mombasa",
    county: "Mombasa",
    size: "60 sqm",
    images: [
      img("photo-1567521464027-f127ff144326"),
      img("photo-1441986300917-64674bd600d8"),
    ],
    verified: true,
    description: "High-footfall retail location on Digo Road. Excellent visibility, glass frontage.",
    features: ["Glass frontage", "High footfall", "Storage room"],
    owner: owners[4],
    createdAt: "2025-06-30",
  },
];

export const popularLocations = [
  { name: "Nairobi", image: img("photo-1611348524140-53c9a25263d6", 600), count: 1240 },
  { name: "Ruiru", image: img("photo-1449844908441-8829872d2607", 600), count: 210 },
  { name: "Juja", image: img("photo-1502005229762-cf1b2da7c5d6", 600), count: 168 },
  { name: "Thika", image: img("photo-1523192193543-6e7296d960e4", 600), count: 145 },
  { name: "Nakuru", image: img("photo-1523805009345-7448845a9e53", 600), count: 320 },
  { name: "Kisumu", image: img("photo-1517154421773-0529f29ea451", 600), count: 180 },
  { name: "Mombasa", image: img("photo-1548013146-72479768bada", 600), count: 420 },
  { name: "Diani", image: img("photo-1507525428034-b723cf961d3e", 600), count: 95 },
  { name: "Eldoret", image: img("photo-1526772662000-3f88f10405ff", 600), count: 140 },
  { name: "Kiambu", image: img("photo-1449034446853-66c86144b0ad", 600), count: 260 },
];

export const propertyRequests = [
  { id: "r1", user: "Peter M.", type: "Rental", title: "Looking for 2BR apartment in Ruiru under KSh 30,000", location: "Ruiru", budget: "KSh 30,000", posted: "2 hours ago", responses: 4 },
  { id: "r2", user: "Anne W.", type: "Home", title: "Need 4-bedroom bungalow in Kiambu with garden", location: "Kiambu", budget: "KSh 15M", posted: "5 hours ago", responses: 7 },
  { id: "r3", user: "David K.", type: "Rental", title: "Furnished bedsitter near JKUAT, Juja", location: "Juja", budget: "KSh 12,000", posted: "1 day ago", responses: 12 },
  { id: "r4", user: "Faith N.", type: "Airbnb", title: "Weekend Airbnb in Diani for family of 6", location: "Diani", budget: "KSh 15,000/night", posted: "3 hours ago", responses: 3 },
  { id: "r5", user: "Brian O.", type: "Commercial", title: "Office 100-150 sqm in Westlands", location: "Westlands", budget: "KSh 150,000", posted: "6 hours ago", responses: 5 },
];

export const categories = [
  { key: "rental" as const, label: "Rentals", href: "/rentals", image: img("photo-1560448204-e02f11c3d0e2", 800), desc: "Apartments & houses to rent" },
  { key: "airbnb" as const, label: "Airbnbs", href: "/airbnbs", image: img("photo-1520250497591-112f2f40a3f4", 800), desc: "Short-stay & holiday homes" },
  { key: "sale" as const, label: "Homes for Sale", href: "/homes-for-sale", image: img("photo-1600596542815-ffad4c1539a9", 800), desc: "Buy your dream home" },
  
  { key: "commercial" as const, label: "Commercial", href: "/commercial-property", image: img("photo-1497366216548-37526070297c", 800), desc: "Offices, shops & warehouses" },
];

export function formatKES(n: number) {
  return "KSh " + n.toLocaleString("en-KE");
}

export function priceLabel(p: Property) {
  const base = formatKES(p.price);
  switch (p.priceUnit) {
    case "month": return `${base}/mo`;
    case "night": return `${base}/night`;
    case "acre": return `${base}/acre`;
    default: return base;
  }
}

// Enrich existing properties with status, tier, transparency and neighborhood defaults
const statusCycle: PropertyStatus[] = ["available","available","pending","reserved","rented","sold","available"];
const tierCycle: VerificationTier[] = ["platinum","gold","silver","bronze"];
const typeByCategory: Record<PropertyCategory, PropertyType[]> = {
  rental: ["Bedsitter","Single Room","Studio","1 Bedroom","2 Bedroom","3 Bedroom","Maisonette"],
  airbnb: ["Airbnb"],
  sale:   ["Bungalow","Townhouse","Villa","Penthouse","Maisonette","4+ Bedroom"],
  land:   ["Land","Farm"],
  commercial: ["Office","Warehouse","Shop"],
};

properties.forEach((p, i) => {
  if (!p.status) p.status = statusCycle[i % statusCycle.length];
  if (!p.verificationTier) p.verificationTier = tierCycle[i % tierCycle.length];
  if (!p.propertyType) p.propertyType = typeByCategory[p.category][i % typeByCategory[p.category].length];
  if (!p.transparency && (p.category === "rental" || p.category === "sale")) {
    p.transparency = {
      water: { type: i % 2 ? "Included" : "Metered", avgMonthly: 1500 + (i * 200) % 3000 },
      electricity: { type: i % 2 ? "Prepaid" : "Postpaid", avgMonthly: 2500 + (i * 250) % 4000 },
      deposit: { amount: p.price * (p.priceUnit === "month" ? 2 : 0.1), refundable: true, conditions: "Refunded within 30 days after vacating, less damages." },
      charges: { garbage: 300, parking: p.parking ? 2000 : 0, security: 1500, service: 2500 },
    };
  }
  if (!p.neighborhood) {
    p.neighborhood = {
      scores: {
        security: 7 + (i % 3),
        quietness: 6 + (i % 4),
        convenience: 7 + ((i + 1) % 3),
        family: 7 + (i % 3),
        overall: 8,
      },
      nearby: [
        { label: "Police Station", name: `${p.location.split(",")[0]} Police Post`, minutes: 5 + (i % 5) },
        { label: "Hospital", name: "Nairobi Hospital Annex", minutes: 8 + (i % 6) },
        { label: "School", name: "Braeburn School", minutes: 10 },
        { label: "Supermarket", name: "Naivas / Carrefour", minutes: 4 },
        { label: "Petrol Station", name: "Shell / Rubis", minutes: 3 },
        { label: "Public Transport", name: "Matatu stage / SGR", minutes: 6 },
      ],
    };
  }
  if (p.category === "airbnb" && !p.airbnbType) {
    const types: AirbnbType[] = ["Entire Place", "Private Room", "Studio"];
    p.airbnbType = (p.bedrooms ?? 0) === 0 ? "Studio" : types[i % types.length];
    p.airbnbBadges = i % 2 === 0
      ? ["Super Host", "Traveler Friendly", "KejaHub Recommended"]
      : ["Couple Friendly", "Work Friendly"];
    p.amenityGroups = {
      essentials: ["WiFi", "Hot Water", "Kitchen", "Refrigerator", "Smart TV"],
      building:   ["Parking", "Security Guard", "CCTV", "Backup Generator"],
      lifestyle:  ["Balcony", "Rooftop Access"],
      business:   ["Workspace", "Fast Internet", "Quiet Environment"],
      family:     ["Family Rooms"],
    };
  }
  if (!p.units && p.category === "rental" && p.propertyType && ["Bedsitter","Studio","1 Bedroom","2 Bedroom"].includes(p.propertyType)) {
    p.units = [
      { type: "Bedsitter", quantity: 8, available: 3, price: 12000 },
      { type: "Studio",    quantity: 3, available: 1, price: 18000 },
      { type: "1 Bedroom", quantity: 5, available: 2, price: 25000 },
      { type: "2 Bedroom", quantity: 4, available: 1, price: 40000 },
    ];
  }
});

// Sample sellers who own multiple properties
export const sellerPortfolios = [
  {
    id: "s1",
    name: "Amina Wanjiku",
    tier: "platinum" as VerificationTier,
    role: "Agent" as const,
    buckets: [
      { label: "Bedsitters", count: 8 },
      { label: "Studios",    count: 3 },
      { label: "1 Bedrooms", count: 6 },
      { label: "2 Bedrooms", count: 5 },
      { label: "Airbnbs",    count: 2 },
    ],
  },
];

export const conciergeServices = [
  { key: "match", name: "Property Match Service", price: 1999, tagline: "We shortlist properties for your exact needs.", features: ["Budget & location intake", "3–5 curated matches", "Owner intros within 48h"] },
  { key: "viewing", name: "Assisted Viewing", price: 2999, from: true, tagline: "A KejaHub rep accompanies you on viewings.", features: ["On-site expert", "Inspection checklist", "Same-day report"] },
  { key: "premium", name: "Premium Concierge Bundle", price: 3999, tagline: "End-to-end — search, viewings and negotiation.", features: ["Full search", "Shortlisting", "Viewing coordination", "Assisted viewing", "Negotiation support"], popular: true },
];
