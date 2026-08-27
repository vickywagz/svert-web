# Svert Web Storefront

Customer-facing React storefront for the Svert commerce platform. When a merchant shares their unique link (`svert-web.vercel.app/m/username`), customers land here to browse products, verify their email, and complete payment — no app download required.

## Live Demo

```
https://svert-web.vercel.app/m/chiboys-store
```

## What it does

A merchant shares a single link anywhere — WhatsApp, Instagram bio, SMS. A customer taps it, sees the merchant's products, adds to cart, verifies their email via OTP, and pays through Paystack. The entire buying experience happens in the browser, no account or app needed.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 8 |
| Language | TypeScript |
| Styling | Tailwind CSS 3 |
| Routing | React Router v6 |
| HTTP client | Axios |
| State | React Context (CartContext) |
| Payments | Paystack hosted checkout |
| Hosting | Vercel |
| CI | GitHub Actions |

## Pages

| Route | Description |
|---|---|
| `/m/:username` | Merchant storefront — product grid, search, category filter, cart |
| `/m/:username/checkout` | Checkout — customer details, OTP email verification, order summary |
| `/m/:username/success` | Payment success — order confirmation, payment reference |
| `*` | 404 — store not found |

## User Flow

```
Customer taps merchant link
        ↓
Storefront loads → fetches GET /storefront/:username
        ↓
Browses products → adds to cart (client-side state)
        ↓
Taps cart → reviews items, adjusts quantities, removes items
        ↓
Taps Continue → Checkout page
        ↓
Fills: name, email, delivery address
        ↓
Taps "Verify Email" → POST /otp/send
Receives 6-digit code → enters it → POST /otp/verify
        ↓
"Confirm & Pay" activates → POST /orders → POST /orders/:id/pay
        ↓
Redirected to Paystack hosted checkout
        ↓
Pays → Paystack webhook fires → order status → paid
        ↓
Redirected to success page with payment reference
```

## Key Implementation Details

**Cart state**: managed entirely in React Context (`CartContext`) — no server, no localStorage. Cart resets on page refresh intentionally (security — prevents stale cart data from a previous session being charged).

**OTP verification**: customer must verify their email before the "Confirm & Pay" button activates. A 2-minute countdown timer shows after OTP is sent. Auto-verifies when all 6 digits are entered — no separate "Submit" button needed.

**Category filtering**: categories are derived dynamically from the merchant's product list — no hardcoded categories in the frontend. If a merchant has no categorized products, the filter tabs don't render.

**Search**: client-side filter on product name — no additional API call. Combined with category filter so both work simultaneously.

**Payment**: backend returns a Paystack `authorization_url` → frontend redirects `window.location.href` to it. On success, Paystack redirects back to `/m/:username/success` with a `reference` query parameter.

## Running Locally

**Prerequisites**: Node.js 20

```bash
# Clone
git clone https://github.com/vickywagz/svert-web
cd svert-web

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173/m/chiboys-store` (or any valid merchant username).

The storefront calls the live Render backend by default:
```typescript
// src/services/api.ts
const api = axios.create({
  baseURL: 'https://svert-backend.onrender.com',
});
```

Change `baseURL` to `http://localhost:4000` for local backend development.

## Project Structure

```
src/
├── pages/
│   ├── StorefrontPage.tsx   # Product grid, search, category filter, cart drawer
│   ├── CheckoutPage.tsx     # Customer form, OTP flow, order summary
│   ├── SuccessPage.tsx      # Payment confirmation
│   └── NotFoundPage.tsx     # 404 fallback
├── context/
│   ├── CartContext.tsx      # Cart state provider
│   └── useCart.ts           # Cart hook
├── services/
│   └── api.ts               # Axios instance + all API calls
└── types/
    └── index.ts             # TypeScript interfaces
```

## CI/CD

GitHub Actions runs on every push to `main`:
1. Install dependencies
2. TypeScript + Vite build check (`npm run build`)

If the build passes, Vercel auto-deploys. If it fails, Vercel does not deploy.

```
push to main → GitHub Actions (build check) → Vercel auto-deploy
```

Vercel routing configured via `public/vercel.json` to handle client-side React Router routes:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## Roadmap

Features deferred from v1:

- **Customer order history** — look up past orders by email
- **Customer-facing receipt download** — PDF receipt on success page
- **Product detail page** — full description, multiple photos
- **Stock indicator** — low stock warnings on product cards
- **Custom domain** — replace Vercel URL with real domain once purchased
- **Merchant bio/description** — storefront hero section with merchant-written description
- **Social sharing meta tags** — proper OG tags so links preview correctly on WhatsApp/Instagram
