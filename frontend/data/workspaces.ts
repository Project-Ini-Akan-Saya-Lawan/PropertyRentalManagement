import { Workspace } from "@/types";

export const workspaces: Workspace[] = [
  // ── WOWO TOWER ──────────────────────────────────────────────────
  {
    id: "wowo-starter",
    slug: "wowo-starter-pack",
    name: "Wowo Starter Pack",
    tower: "Wowo Tower",
    pack: "Starter Pack",
    description: "Ideal for startups and solopreneurs.",
    longDescription:
      "The Wowo Starter Pack is a fully-equipped shared workspace on the lower floors of Wowo Tower. Perfect for freelancers and early-stage startups who need a professional address and reliable infrastructure without a long-term commitment.",
    image: "/buildings/wostarpack.png",
    gallery: [
      "/buildings/wostarpack.png",
      "/buildings/wobuspack.png",
      "/buildings/woexpack.png",
    ],
    capacity: 2,
    workspaceType: "Coworking Desk",
    floorRange: "Floors 5 – 10",
    monthlyPrice: 500000000,
    taxRate: 0.11,
    securityDeposit: 1000000000,
    features: [
      "Available in 2 towers: 5–10 floors",
      "Designed for smaller operations (2–5 people)",
      "Includes access to shared facilities",
      "Hot desk with locker storage",
      "Business address service",
    ],
    availability: "Available",
    relatedSlugs: [
      "wowo-business-pack",
      "wowo-executive-pack",
      "wowi-starter-pack",
    ],
  },
  {
    id: "wowo-business",
    slug: "wowo-business-pack",
    name: "Wowo Business Pack",
    tower: "Wowo Tower",
    pack: "Business Pack",
    description: "Designed for growing teams needing privacy and space.",
    longDescription:
      "The Wowo Business Pack offers a dedicated private office suite on mid-rise floors with access to premium meeting rooms and business lounge. Ideal for established SMEs looking to elevate their professional image.",
    image: "/buildings/wobuspack.png",
    gallery: [
      "/buildings/wobuspack.png",
      "/buildings/wostarpack.png",
      "/buildings/woexpack.png",
    ],
    capacity: 10,
    workspaceType: "Business Executive",
    floorRange: "Floors 11 – 18",
    monthlyPrice: 700000000,
    taxRate: 0.11,
    securityDeposit: 1400000000,
    features: [
      "Available in 2 towers: 11–18 floors",
      "Designed for mid-size teams (10–20 people)",
      "Includes 10 meeting room hours/month",
      "Dedicated phone line & reception",
      "Premium business lounge access",
    ],
    availability: "Available",
    relatedSlugs: [
      "wowo-starter-pack",
      "wowo-executive-pack",
      "wowi-business-pack",
    ],
  },
  {
    id: "wowo-executive",
    slug: "wowo-executive-pack",
    name: "Wowo Executive Pack",
    tower: "Wowo Tower",
    pack: "Executive Pack",
    description: "Premium floors with panoramic views for top-tier executives.",
    longDescription:
      "The pinnacle of workspace luxury. The Wowo Executive Pack places your organisation on the highest floors of Wowo Tower with panoramic city views, dedicated concierge, VIP parking, and an exclusive boardroom suite.",
    image: "/buildings/woexpack.png",
    gallery: [
      "/buildings/woexpack.png",
      "/buildings/wobuspack.png",
      "/buildings/wostarpack.png",
    ],
    capacity: 30,
    workspaceType: "Business Executive",
    floorRange: "Floors 19 – 25",
    monthlyPrice: 1000000000,
    taxRate: 0.11,
    securityDeposit: 2000000000,
    features: [
      "Premium floors with panoramic views",
      "Designed for large corporations (20–30+ people)",
      "Unlimited boardroom access",
      "VIP parking & dedicated concierge",
      "Custom office branding available",
    ],
    availability: "Limited",
    relatedSlugs: [
      "wowo-business-pack",
      "wowi-executive-pack",
      "wowi-business-pack",
    ],
  },

  // ── WOWI TOWER ──────────────────────────────────────────────────
  {
    id: "wowi-starter",
    slug: "wowi-starter-pack",
    name: "Wowi Starter Pack",
    tower: "Wiwi Tower",
    pack: "Starter Pack",
    description: "Affordable entry workspace in Wowi Tower.",
    longDescription:
      "Start your business journey in the prestigious Wowi Tower. The Starter Pack offers a professional coworking environment with reliable high-speed internet, a business mailing address, and access to shared facilities.",
    image: "/buildings/wistarpack.png",
    gallery: [
      "/buildings/wistarpack.png",
      "/buildings/wibuspack.png",
      "/buildings/wiexpack.png",
    ],
    capacity: 2,
    workspaceType: "Coworking Desk",
    floorRange: "Floors 5 – 10",
    monthlyPrice: 500000000,
    taxRate: 0.11,
    securityDeposit: 1000000000,
    features: [
      "Available in Wowi Tower: 5–10 floors",
      "Ideal for freelancers and startups",
      "Includes shared lounge & pantry access",
      "Hot desk with secure locker",
      "Complimentary mail handling",
    ],
    availability: "Available",
    relatedSlugs: [
      "wowi-business-pack",
      "wowi-executive-pack",
      "wowo-starter-pack",
    ],
  },
  {
    id: "wowi-business",
    slug: "wowi-business-pack",
    name: "Wowi Business Pack",
    tower: "Wiwi Tower",
    pack: "Business Pack",
    description: "Flexible private offices for scaling businesses.",
    longDescription:
      "The Wowi Business Pack delivers a fully-serviced private office suite on Wowi Tower's mid floors. With access to state-of-the-art meeting facilities, professional reception, and a thriving business community.",
    image: "/buildings/wibuspack.png",
    gallery: [
      "/buildings/wibuspack.png",
      "/buildings/wistarpack.png",
      "/buildings/wiexpack.png",
    ],
    capacity: 10,
    workspaceType: "Business Executive",
    floorRange: "Floors 11 – 18",
    monthlyPrice: 700000000,
    taxRate: 0.11,
    securityDeposit: 1400000000,
    features: [
      "Private suite in Wowi Tower: 11–18 floors",
      "Ideal for growing teams of 10–20 people",
      "8 meeting room hours/month",
      "Professional reception & cleaning daily",
      "Business lounge & event space access",
    ],
    availability: "Available",
    relatedSlugs: [
      "wowi-starter-pack",
      "wowi-executive-pack",
      "wowo-business-pack",
    ],
  },
  {
    id: "wowi-executive",
    slug: "wowi-executive-pack",
    name: "Wowi Executive Pack",
    tower: "Wiwi Tower",
    pack: "Executive Pack",
    description: "Exclusive upper-floor suite with city skyline views.",
    longDescription:
      "Command your industry from the upper floors of Wowi Tower. The Executive Pack provides an exclusive, fully-branded private floor with skyline panoramas, a dedicated PA, unlimited boardroom use, and premium concierge services.",
    image: "/buildings/wiexpack.png",
    gallery: [
      "/buildings/wiexpack.png",
      "/buildings/wibuspack.png",
      "/buildings/wistarpack.png",
    ],
    capacity: 30,
    workspaceType: "Business Executive",
    floorRange: "Floors 19 – 25",
    monthlyPrice: 1000000000,
    taxRate: 0.11,
    securityDeposit: 2000000000,
    features: [
      "Exclusive upper floors in Wowi Tower",
      "Large teams: 20–30+ professionals",
      "Full-floor private suite with branding",
      "Unlimited meeting & boardroom access",
      "Dedicated PA & VIP services",
    ],
    availability: "Limited",
    relatedSlugs: [
      "wowi-business-pack",
      "wowo-executive-pack",
      "wowo-business-pack",
    ],
  },
];

export function getWorkspaceBySlug(slug: string) {
  return workspaces.find((w) => w.slug === slug);
}
export function getWowoWorkspaces() {
  return workspaces.filter((w) => w.tower === "Wowo Tower");
}
export function getWowiWorkspaces() {
  return workspaces.filter((w) => w.tower === "Wiwi Tower");
}
