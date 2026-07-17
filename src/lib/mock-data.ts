export type PropertyStatus = "available" | "pending" | "reserved" | "sold" | "rented";

export type PropertyCategory = "rental" | "airbnb" | "sale" | "commercial";

export interface PropertyOwner {
  name: string;
  phone: string;
  verificationTier: "unverified" | "verified" | "premium";
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  location: string;
  price: number;
  category: PropertyCategory;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  amenities: string[];
  images: string[];
  description: string;
  featured: boolean;
  status: PropertyStatus;
  owner: PropertyOwner;
}

export function formatKES(n: number): string {
  return `KSh ${n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function priceLabel(price: number, category: PropertyCategory): string {
  if (category === "rental") {
    return `${formatKES(price)}/month`;
  }
  if (category === "airbnb") {
    return `${formatKES(price)}/night`;
  }
  return formatKES(price);
}

export const statusMeta: Record<
  PropertyStatus,
  { label: string; color: string; dot: string }
> = {
  available: {
    label: "Available",
    color: "bg-green-100 text-green-800",
    dot: "bg-green-500",
  },
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    dot: "bg-yellow-500",
  },
  reserved: {
    label: "Reserved",
    color: "bg-blue-100 text-blue-800",
    dot: "bg-blue-500",
  },
  sold: {
    label: "Sold",
    color: "bg-gray-100 text-gray-800",
    dot: "bg-gray-500",
  },
  rented: {
    label: "Rented",
    color: "bg-purple-100 text-purple-800",
    dot: "bg-purple-500",
  },
};

export const tierMeta: Record<
  "unverified" | "verified" | "premium",
  { label: string; color: string }
> = {
  unverified: {
    label: "Unverified",
    color: "text-gray-500",
  },
  verified: {
    label: "Verified",
    color: "text-green-600",
  },
  premium: {
    label: "Premium",
    color: "text-amber-600",
  },
};

export const properties: Property[] = [
  {
    id: "prop-1",
    slug: "cozy-apartment-kilimani",
    title: "Cozy 1BR Apartment in Kilimani",
    location: "Kilimani, Nairobi",
    price: 35000,
    category: "rental",
    propertyType: "Apartment",
    bedrooms: 1,
    bathrooms: 1,
    size: 450,
    amenities: [
      "WiFi",
      "Parking",
      "Kitchen",
      "Balcony",
      "Water Tank",
      "24/7 Security",
    ],
    images: [
      "https://images.pexels.com/photos/32870/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/98839/pexels-photo-98839.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    description:
      "Beautiful cozy apartment with modern furnishings, natural lighting, and access to nearby amenities. Perfect for young professionals.",
    featured: true,
    status: "available",
    owner: {
      name: "John Mwangi",
      phone: "+254712345678",
      verificationTier: "verified",
    },
  },
  {
    id: "prop-2",
    slug: "modern-villa-westlands",
    title: "Modern 3BR Villa in Westlands",
    location: "Westlands, Nairobi",
    price: 15000000,
    category: "sale",
    propertyType: "Villa",
    bedrooms: 3,
    bathrooms: 3,
    size: 2500,
    amenities: [
      "Swimming Pool",
      "Garden",
      "Gym",
      "Staff Quarter",
      "Gate",
      "Generator",
    ],
    images: [
      "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    description:
      "Stunning modern villa with premium finishes, spacious rooms, and beautiful garden. Ideal for families seeking luxury living.",
    featured: true,
    status: "available",
    owner: {
      name: "Sarah Kipchoge",
      phone: "+254722987654",
      verificationTier: "premium",
    },
  },
  {
    id: "prop-3",
    slug: "airbnb-studio-nairobi",
    title: "Stylish Studio Apartment - Nairobi CBD",
    location: "Nairobi CBD",
    price: 4500,
    category: "airbnb",
    propertyType: "Studio",
    bedrooms: 1,
    bathrooms: 1,
    size: 350,
    amenities: [
      "WiFi",
      "TV",
      "AC",
      "Hot Water",
      "Kitchen",
      "Free Breakfast",
    ],
    images: [
      "https://images.pexels.com/photos/3938021/pexels-photo-3938021.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    description:
      "Cozy studio apartment perfect for business travelers and tourists. Located in the heart of Nairobi with easy access to major attractions.",
    featured: false,
    status: "available",
    owner: {
      name: "Mary Ochieng",
      phone: "+254733456789",
      verificationTier: "verified",
    },
  },
  {
    id: "prop-4",
    slug: "commercial-space-upper-hill",
    title: "Office Space in Upper Hill",
    location: "Upper Hill, Nairobi",
    price: 250000,
    category: "commercial",
    propertyType: "Office",
    bedrooms: 0,
    bathrooms: 2,
    size: 1200,
    amenities: [
      "WiFi",
      "CCTV",
      "Parking",
      "Reception",
      "Conference Room",
      "Kitchen",
    ],
    images: [
      "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    description:
      "Prime office space in Upper Hill with modern infrastructure and excellent connectivity. Suitable for startups and established companies.",
    featured: true,
    status: "available",
    owner: {
      name: "David Kariuki",
      phone: "+254744567890",
      verificationTier: "premium",
    },
  },
  {
    id: "prop-5",
    slug: "spacious-2br-southc",
    title: "Spacious 2BR Apartment in South C",
    location: "South C, Nairobi",
    price: 48000,
    category: "rental",
    propertyType: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    size: 750,
    amenities: ["WiFi", "Parking", "Gym", "Lift", "Balcony", "Spacious"],
    images: [
      "https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/2873183/pexels-photo-2873183.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    description:
      "Large two-bedroom apartment with modern amenities, proximity to shopping centers and schools. Great for families.",
    featured: false,
    status: "reserved",
    owner: {
      name: "Alice Njeri",
      phone: "+254755678901",
      verificationTier: "verified",
    },
  },
  {
    id: "prop-6",
    slug: "beachfront-cottage-mombasa",
    title: "Beachfront Cottage in Mombasa",
    location: "Mombasa",
    price: 6200,
    category: "airbnb",
    propertyType: "Cottage",
    bedrooms: 2,
    bathrooms: 2,
    size: 800,
    amenities: [
      "Beach Access",
      "WiFi",
      "Pool",
      "Kitchen",
      "Lounge",
      "BBQ Area",
    ],
    images: [
      "https://images.pexels.com/photos/2869499/pexels-photo-2869499.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/2022616/pexels-photo-2022616.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    description:
      "Beautiful beachfront cottage offering the perfect getaway with direct access to the beach and stunning ocean views.",
    featured: true,
    status: "available",
    owner: {
      name: "Hassan Mohamed",
      phone: "+254766789012",
      verificationTier: "verified",
    },
  },
  {
    id: "prop-7",
    slug: "land-plot-rongai",
    title: "Residential Land Plot in Rongai",
    location: "Rongai, Nairobi",
    price: 3500000,
    category: "sale",
    propertyType: "Land",
    bedrooms: 0,
    bathrooms: 0,
    size: 5000,
    amenities: ["Mains Water", "Electricity", "Fenced", "Accessible Road"],
    images: [
      "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1438761/pexels-photo-1438761.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    description:
      "Large residential land plot in developing Rongai area. Perfect for building your dream home with good accessibility.",
    featured: false,
    status: "available",
    owner: {
      name: "Peter Kipkemboi",
      phone: "+254777890123",
      verificationTier: "premium",
    },
  },
  {
    id: "prop-8",
    slug: "luxury-penthouse-karen",
    title: "Luxury 4BR Penthouse in Karen",
    location: "Karen, Nairobi",
    price: 25000000,
    category: "sale",
    propertyType: "Penthouse",
    bedrooms: 4,
    bathrooms: 4,
    size: 3500,
    amenities: [
      "Rooftop Terrace",
      "Wine Cellar",
      "Home Theater",
      "Smart Home",
      "Elevator",
      "Infinity Pool",
    ],
    images: [
      "https://images.pexels.com/photos/3556054/pexels-photo-3556054.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3556058/pexels-photo-3556058.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    description:
      "Exclusive luxury penthouse with world-class amenities, panoramic city views, and state-of-the-art smart home technology.",
    featured: true,
    status: "available",
    owner: {
      name: "Catherine Mutua",
      phone: "+254788901234",
      verificationTier: "premium",
    },
  },
  {
    id: "prop-9",
    slug: "boutique-hotel-westlands",
    title: "Boutique Hotel Building - Westlands",
    location: "Westlands, Nairobi",
    price: 500000,
    category: "commercial",
    propertyType: "Hotel",
    bedrooms: 0,
    bathrooms: 10,
    size: 8000,
    amenities: [
      "Parking",
      "Conference Rooms",
      "Restaurant",
      "Lounge",
      "CCTV",
      "Backup Power",
    ],
    images: [
      "https://images.pexels.com/photos/1885658/pexels-photo-1885658.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/2258534/pexels-photo-2258534.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    description:
      "Boutique hotel property with excellent operational history and high occupancy rates. Prime investment opportunity.",
    featured: false,
    status: "sold",
    owner: {
      name: "Richard Nyambane",
      phone: "+254799012345",
      verificationTier: "premium",
    },
  },
  {
    id: "prop-10",
    slug: "garden-apartment-gigiri",
    title: "Garden Apartment in Gigiri",
    location: "Gigiri, Nairobi",
    price: 55000,
    category: "rental",
    propertyType: "Apartment",
    bedrooms: 3,
    bathrooms: 2,
    size: 1100,
    amenities: [
      "Garden",
      "Parking",
      "WiFi",
      "Kitchen",
      "Laundry",
      "Security",
    ],
    images: [
      "https://images.pexels.com/photos/2350266/pexels-photo-2350266.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/2350291/pexels-photo-2350291.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    description:
      "Elegant garden apartment with spacious rooms and lush surroundings. Located in the upscale Gigiri neighborhood.",
    featured: true,
    status: "available",
    owner: {
      name: "Jane Kipchoge",
      phone: "+254700123456",
      verificationTier: "verified",
    },
  },
  {
    id: "prop-11",
    slug: "studio-apartment-parklands",
    title: "Studio Apartment in Parklands",
    location: "Parklands, Nairobi",
    price: 28000,
    category: "rental",
    propertyType: "Studio",
    bedrooms: 1,
    bathrooms: 1,
    size: 350,
    amenities: ["WiFi", "Parking", "AC", "Kitchen", "Balcony", "Water"],
    images: [
      "https://images.pexels.com/photos/1546168/pexels-photo-1546168.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1707267/pexels-photo-1707267.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    description:
      "Neat studio apartment perfect for singles or couples. Easy access to shopping and entertainment facilities.",
    featured: false,
    status: "pending",
    owner: {
      name: "Grace Wanjiru",
      phone: "+254711234567",
      verificationTier: "unverified",
    },
  },
  {
    id: "prop-12",
    slug: "resort-property-diani",
    title: "Resort Property in Diani Beach",
    location: "Diani Beach, Mombasa",
    price: 50000,
    category: "airbnb",
    propertyType: "Resort",
    bedrooms: 8,
    bathrooms: 8,
    size: 4000,
    amenities: [
      "Beach Access",
      "Pool",
      "Restaurant",
      "WiFi",
      "Spa",
      "Water Sports",
    ],
    images: [
      "https://images.pexels.com/photos/2869499/pexels-photo-2869499.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3580888/pexels-photo-3580888.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    description:
      "Luxurious resort property with direct beach access, perfect for vacation rentals and corporate retreats.",
    featured: true,
    status: "rented",
    owner: {
      name: "Amina Hassan",
      phone: "+254722345678",
      verificationTier: "premium",
    },
  },
];

export interface ConciergeService {
  key: string;
  name: string;
  tagline: string;
  price: number;
  from: boolean;
  popular: boolean;
  features: string[];
}

export const conciergeServices: ConciergeService[] = [
  {
    key: "property-inspection",
    name: "Property Inspection",
    tagline: "Professional inspection by certified agents",
    price: 5000,
    from: false,
    popular: true,
    features: [
      "Comprehensive property assessment",
      "Detailed inspection report",
      "Photo and video documentation",
      "Condition recommendations",
      "Market value assessment",
    ],
  },
  {
    key: "tenant-vetting",
    name: "Tenant Vetting",
    tagline: "Thorough background checks for peace of mind",
    price: 8000,
    from: false,
    popular: false,
    features: [
      "Background verification",
      "Employment confirmation",
      "Credit history check",
      "Reference verification",
      "Detailed vetting report",
    ],
  },
  {
    key: "property-management",
    name: "Property Management",
    tagline: "End-to-end management services",
    price: 15000,
    from: true,
    popular: true,
    features: [
      "Tenant acquisition and screening",
      "Rent collection and accounting",
      "Maintenance coordination",
      "Monthly financial reports",
      "24/7 emergency support",
    ],
  },
];
