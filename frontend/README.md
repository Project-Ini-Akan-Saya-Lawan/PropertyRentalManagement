# Rupiah Building – Frontend

> Premium workspace and office rental platform for W Jababeka Twin Towers.

---

## Quick Start

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

---

## Tech Stack

| Package | Version | Purpose |
|---|---|---|
| Next.js | 15.0.0 | App Router, SSG/SSR |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | ^3.4 | Utility styling |
| Framer Motion | ^11 | Animations |
| React Hook Form | ^7 | Form management |
| Zod | ^3 | Validation |
| Lucide React | ^0.439 | Icons |

---

## Folder Structure

```
frontend/
├── app/
│   ├── layout.tsx            # Root layout + Navbar
│   ├── page.tsx              # Home
│   ├── not-found.tsx         # 404
│   ├── _sections/            # Home-only sections
│   ├── workspace/
│   │   ├── page.tsx          # Workspace listing
│   │   └── [slug]/
│   │       ├── page.tsx      # Workspace detail (SSG)
│   │       ├── WorkspaceDetailClient.tsx
│   │       └── rent-details/
│   │           ├── page.tsx              # Step 1 – Rent Info
│   │           ├── confirm-details/
│   │           │   └── page.tsx          # Step 2 – Personal Details
│   │           └── payment/
│   │               └── page.tsx          # Step 3 – Payment
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── login/page.tsx
│   └── signup/page.tsx
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx        # Sticky navbar, mobile drawer
│   │   └── Footer.tsx        # 4-column footer
│   ├── sections/
│   │   ├── HeroSection.tsx   # Reusable hero banner
│   │   ├── StatsSection.tsx  # Animated counters
│   │   ├── MembersSection.tsx# Infinite marquee carousel
│   │   ├── WorkspaceServices.tsx
│   │   ├── AmenitiesSection.tsx
│   │   └── GallerySection.tsx
│   ├── cards/
│   │   └── WorkspaceCard.tsx
│   └── booking/
│       ├── BookingStepper.tsx
│       └── BookingSummary.tsx
│
├── data/           # Mock data (swap out for API in services/)
├── services/       # API service layer – ready for backend
├── types/          # TypeScript interfaces
├── hooks/          # Custom React hooks
├── lib/            # Utilities (cn, formatIDR)
├── styles/         # globals.css
└── public/
    ├── logos/      rupiah-logo.png
    ├── buildings/  building-front.png, building-aerial-1.png, building-aerial-2.png
    ├── workspaces/ (add interior photos here)
    ├── partners/   (add partner logos here)
    └── payments/   (add payment logos here)
```

---

## Pages

| Route | Page |
|---|---|
| `/` | Home |
| `/workspace` | Workspace listing |
| `/workspace/wowo-starter-pack` | Workspace detail |
| `/workspace/[slug]/rent-details` | Booking step 1 |
| `/workspace/[slug]/rent-details/confirm-details` | Booking step 2 |
| `/workspace/[slug]/rent-details/payment` | Booking step 3 |
| `/about` | About Us |
| `/contact` | Contact Us |
| `/login` | Login |
| `/signup` | Sign Up |

---

## Environment Variables

Create `.env.local`:

```env
# Leave empty to use mock data
NEXT_PUBLIC_API_URL=

# Optional
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

---

## Backend Integration

The `services/` layer is API-ready. When your backend is live, just set `NEXT_PUBLIC_API_URL` — UI components remain unchanged.

```ts
// Before (mock)
return Promise.resolve(workspaces);

// After (API)
return fetch(`${API}/workspaces`).then(r => r.json());
```

---

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Start production
npm run lint     # ESLint
```
