import { Workspace } from "@/types";

// Static data untuk gambar, gallery, features, capacity
// yang tidak ada di database
const STATIC_DATA: Record<string, Partial<Workspace>> = {
  "wowo-starter-pack": {
    image: "/buildings/wostarpack.png",
    gallery: [
      "/buildings/cofsec.png",
      "/buildings/store.png",
      "/buildings/winseat.png",
    ],
    capacity: 2,
    workspaceType: "Coworking Desk",
    taxRate: 0.11,
    securityDeposit: 1000000000,
    longDescription:
      "The Wowo Starter Pack is a fully-equipped shared workspace on the lower floors of Wowo Tower. Perfect for freelancers and early-stage startups who need a professional address and reliable infrastructure without a long-term commitment.",
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
  "wowo-business-pack": {
    image: "/buildings/wobuspack.png",
    gallery: [
      "/buildings/bmeetroom.png",
      "/buildings/bopen.png",
      "/buildings/bpan.png",
    ],
    capacity: 10,
    workspaceType: "Business Executive",
    taxRate: 0.11,
    securityDeposit: 1400000000,
    longDescription:
      "The Wowo Business Pack offers a dedicated private office suite on mid-rise floors with access to premium meeting rooms and business lounge. Ideal for established SMEs looking to elevate their professional image.",
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
  "wowo-executive-pack": {
    image: "/buildings/woexpack.png",
    gallery: [
      "/buildings/emeet.png",
      "/buildings/eopen.png",
      "/buildings/epan.png",
    ],
    capacity: 30,
    workspaceType: "Business Executive",
    taxRate: 0.11,
    securityDeposit: 2000000000,
    longDescription:
      "The pinnacle of workspace luxury. The Wowo Executive Pack places your organisation on the highest floors of Wowo Tower with panoramic city views, dedicated concierge, VIP parking, and an exclusive boardroom suite.",
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
  "wowi-starter-pack": {
    image: "/buildings/wistarpack.png",
    gallery: [
      "/buildings/sipan.png",
      "/buildings/sisto.png",
      "/buildings/siwin.png",
    ],
    capacity: 2,
    workspaceType: "Coworking Desk",
    taxRate: 0.11,
    securityDeposit: 1000000000,
    longDescription:
      "Start your business journey in the prestigious Wowi Tower. The Starter Pack offers a professional coworking environment with reliable high-speed internet, a business mailing address, and access to shared facilities.",
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
  "wowi-business-pack": {
    image: "/buildings/wibuspack.png",
    gallery: [
      "/buildings/bimeet.png",
      "/buildings/biopen.png",
      "/buildings/bipan.png",
    ],
    capacity: 10,
    workspaceType: "Business Executive",
    taxRate: 0.11,
    securityDeposit: 1400000000,
    longDescription:
      "The Wowi Business Pack delivers a fully-serviced private office suite on Wowi Tower's mid floors. With access to state-of-the-art meeting facilities, professional reception, and a thriving business community.",
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
  "wowi-executive-pack": {
    image: "/buildings/wiexpack.png",
    gallery: [
      "/buildings/eimeet.png",
      "/buildings/eiopen.png",
      "/buildings/eipan.png",
    ],
    capacity: 30,
    workspaceType: "Business Executive",
    taxRate: 0.11,
    securityDeposit: 2000000000,
    longDescription:
      "Command your industry from the upper floors of Wowi Tower. The Executive Pack provides an exclusive, fully-branded private floor with skyline panoramas, a dedicated PA, unlimited boardroom use, and premium concierge services.",
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
};

// Mapping pack_id → slug
const PACK_ID_TO_SLUG: Record<number, string> = {
  1: "wowo-starter-pack",
  2: "wowo-business-pack",
  3: "wowo-executive-pack",
  4: "wowi-starter-pack",
  5: "wowi-business-pack",
  6: "wowi-executive-pack",
};

// Mapping property_id → tower name
const TOWER_MAP: Record<number, "Wowo Tower" | "Wiwi Tower"> = {
  1: "Wowo Tower",
  2: "Wiwi Tower",
};

// Mapping pack_id → pack type
const PACK_TYPE_MAP: Record<
  number,
  "Starter Pack" | "Business Pack" | "Executive Pack"
> = {
  1: "Starter Pack",
  2: "Business Pack",
  3: "Executive Pack",
  4: "Starter Pack",
  5: "Business Pack",
  6: "Executive Pack",
};

// Convert API floor pack to Workspace
export function apiPackToWorkspace(pack: {
  pack_id: number;
  pack_name: string;
  property_id: number;
  description: string;
  floor_range: string;
  price: number | string;
}): Workspace {
  const slug = PACK_ID_TO_SLUG[pack.pack_id] || `pack-${pack.pack_id}`;
  const static_ = STATIC_DATA[slug] || {};

  return {
    id: String(pack.pack_id),
    slug,
    name: pack.pack_name,
    tower: TOWER_MAP[pack.property_id] || "Wowo Tower",
    pack: PACK_TYPE_MAP[pack.pack_id] || "Starter Pack",
    description: pack.description || "",
    longDescription: static_.longDescription || pack.description || "",
    image: static_.image || "/buildings/building-front.png",
    gallery: static_.gallery || [],
    capacity: static_.capacity || 10,
    workspaceType: static_.workspaceType || "Coworking Desk",
    floorRange: `Floors ${pack.floor_range}`,
    monthlyPrice: Number(pack.price),
    taxRate: static_.taxRate || 0.11,
    securityDeposit: static_.securityDeposit || Number(pack.price) * 2,
    features: static_.features || [],
    availability: static_.availability || "Available",
    relatedSlugs: static_.relatedSlugs || [],
  };
}

// Static workspaces sebagai fallback kalau API gagal
export const workspaces: Workspace[] = Object.entries(PACK_ID_TO_SLUG).map(
  ([id, slug]) => {
    const static_ = STATIC_DATA[slug] || {};
    const packId = Number(id);
    return {
      id: String(packId),
      slug,
      name: slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      tower: TOWER_MAP[packId <= 3 ? 1 : 2],
      pack: PACK_TYPE_MAP[packId],
      description: static_.longDescription?.slice(0, 80) || "",
      longDescription: static_.longDescription || "",
      image: static_.image || "/buildings/building-front.png",
      gallery: static_.gallery || [],
      capacity: static_.capacity || 10,
      workspaceType: static_.workspaceType || "Coworking Desk",
      floorRange:
        packId % 3 === 1
          ? "Floors 5 – 10"
          : packId % 3 === 2
            ? "Floors 11 – 18"
            : "Floors 19 – 25",
      monthlyPrice:
        packId % 3 === 1
          ? 500000000
          : packId % 3 === 2
            ? 700000000
            : 1000000000,
      taxRate: 0.11,
      securityDeposit:
        packId % 3 === 1
          ? 1000000000
          : packId % 3 === 2
            ? 1400000000
            : 2000000000,
      features: static_.features || [],
      availability: static_.availability || "Available",
      relatedSlugs: static_.relatedSlugs || [],
    };
  },
);

export function getWorkspaceBySlug(slug: string): Workspace | undefined {
  return workspaces.find((w) => w.slug === slug);
}

export function getWowoWorkspaces(): Workspace[] {
  return workspaces.filter((w) => w.tower === "Wowo Tower");
}

export function getWowiWorkspaces(): Workspace[] {
  return workspaces.filter((w) => w.tower === "Wiwi Tower");
}
