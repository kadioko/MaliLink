# MaliLink

B2B Trade & Import Management Platform for Kariakoo wholesalers and East African importers.

MaliLink connects importers with suppliers, manages orders from web and WhatsApp, handles payments via M-Pesa and mobile money, and provides supplier credit scoring — all in one platform.

## Features

- **Multi-channel ordering** — Place orders via the web dashboard or WhatsApp bot
- **Supplier directory** — Browse and connect with verified suppliers (Free, Basic, Premium, Featured tiers)
- **Order tracking** — Full lifecycle from draft to delivery, including customs status
- **Mobile payments** — M-Pesa, Tigo Pesa, Airtel Money, bank transfer, and cash
- **Credit system** — Suppliers can extend credit lines to trusted importers with scoring
- **WhatsApp bot** — Conversational ordering and order status checks via Twilio
- **KYC verification** — Supplier and importer identity verification
- **In-app messaging** — Direct communication between importers and suppliers
- **Dashboard analytics** — Revenue, order volume, and business insights

## Role Capabilities

### Importer

- **Browse suppliers and products**
  - View the supplier directory and active supplier listings
  - Browse product catalog entries with TZS-first pricing, MOQ, stock status, and supplier details

- **Create and manage orders**
  - Start new web orders from the dashboard
  - Select suppliers and in-stock products
  - Enter quantities, validate MOQ, and submit orders
  - View own order history, totals, statuses, and order source

- **Initiate payments**
  - Access the M-Pesa checkout section on the payments page
  - Start Snippe-hosted checkout for unpaid order balances
  - Track payment status with polling after checkout begins
  - View gateway references and M-Pesa receipt/reference details after settlement

- **Monitor payment and credit records**
  - View payment history, statuses, and references tied to the account
  - View credit lines where the importer is the borrower
  - Review outstanding, repaid, overdue, and active credit balances

- **Use WhatsApp ordering flows**
  - Interact with the WhatsApp bot for product discovery and ordering
  - Receive payment and order updates through integrated messaging flows

- **Current limitations**
  - Can only initiate checkout when there is an unpaid order balance
  - Cannot use admin-only platform oversight capabilities

### Supplier

- **Manage product catalog**
  - Add products from the supplier dashboard
  - Edit product details including name, Swahili name, category, unit, MOQ, description, image URLs, and stock state
  - Set and maintain TZS pricing for listings
  - Delete products from the managed catalog

- **Monitor incoming business**
  - View orders where the supplier is the seller
  - Review order totals, item counts, counterparties, statuses, and order source
  - Track recent order activity from the dashboard

- **Track payments and credit**
  - View payment history associated with the supplier account
  - Review payment statuses and available references
  - View credit lines where the supplier is the lender
  - Track active, overdue, repaid, and outstanding credit exposure

- **Appear in the supplier marketplace**
  - Be represented through supplier listings in the directory
  - Surface business details, listing tier, ratings, review counts, and product counts to buyers

- **Benefit from WhatsApp ordering**
  - Receive business generated through importer WhatsApp ordering flows
  - Participate in the downstream order and payment lifecycle once orders are placed

- **Current limitations**
  - Cannot initiate Snippe M-Pesa checkout for order balances from the payments page
  - Checkout initiation is reserved for importer accounts paying outstanding balances
  - Does not have platform-wide administrative controls

### Admin

- **Platform-wide visibility**
  - View dashboard summaries across the platform
  - View orders, payments, and other system data without being restricted to a single buyer or supplier

- **Operational oversight**
  - Monitor payment activity and settlement states
  - Review supplier and importer activity through shared dashboard and listing surfaces

- **Current limitations**
  - The current UI is more business-operations oriented than admin-control-panel oriented
  - Dedicated admin-only management workflows are still limited compared to importer and supplier day-to-day flows

### Shared capabilities across authenticated roles

- **Access dashboard views**
  - Use dashboard navigation, role-aware summaries, and recent activity views

- **Review financial information in TZS-first format**
  - Most business-facing surfaces prioritize Tanzanian shilling display

- **View role-relevant orders, payments, and credit records**
  - Data visibility is scoped by role and ownership rules in the application

- **Authenticate and sign out**
  - Access the protected dashboard after login
  - Sign out from the desktop sidebar or mobile dashboard menu

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| WhatsApp | Twilio API |
| Payments | M-Pesa API |
| Hosting | Vercel (recommended) |

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login & registration pages
│   ├── (dashboard)/      # Protected dashboard pages
│   │   ├── dashboard/    # Overview & analytics
│   │   ├── orders/       # Order management
│   │   ├── products/     # Product catalog
│   │   ├── suppliers/    # Supplier directory
│   │   ├── payments/     # Payment history
│   │   └── credit/       # Credit lines
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth + registration
│   │   ├── orders/       # Order CRUD
│   │   ├── products/     # Product CRUD
│   │   ├── suppliers/    # Supplier listings
│   │   ├── payments/     # Payment processing
│   │   ├── credit/       # Credit management
│   │   ├── whatsapp/     # WhatsApp webhook
│   │   └── dashboard/    # Dashboard stats
│   └── page.tsx          # Landing page
├── components/           # Reusable UI components
├── lib/                  # Utilities & config
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Prisma client
│   ├── whatsapp.ts       # WhatsApp bot engine
│   ├── constants.ts      # App constants
│   └── utils.ts          # Helper functions
├── types/                # TypeScript type definitions
prisma/
├── schema.prisma         # Database schema
└── seed.ts               # Seed data
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted)
- Twilio account (for WhatsApp bot, optional)

### 1. Clone and install

```bash
git clone https://github.com/kadioko/MaliLink.git
cd MaliLink
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Database (required)
DATABASE_URL="postgresql://user:password@localhost:5432/malilink"

# NextAuth (required)
NEXTAUTH_SECRET="generate-a-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Twilio - WhatsApp Bot (optional)
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"

# Snippe Payments (optional)
SNIPPE_API_KEY=""
SNIPPE_WEBHOOK_SECRET=""
SNIPPE_BASE_URL="https://api.snippe.sh"
```

### 3. Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

MaliLink is built on Next.js and deploys to Vercel with zero configuration.

### Step 1: Push to GitHub

Make sure your code is pushed to a GitHub repository.

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Select the **MaliLink** repository
4. Vercel auto-detects Next.js — no build settings to change

### Step 3: Add environment variables

In the Vercel project settings, add these environment variables:

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | Your PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | A random secret (`openssl rand -base64 32`) | Yes |
| `NEXTAUTH_URL` | Your Vercel domain (e.g. `https://malilink.vercel.app`) | Yes |
| `USD_TO_TZS_RATE` | Fallback exchange rate (e.g. `2500`) | Optional |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | For WhatsApp |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | For WhatsApp |
| `TWILIO_WHATSAPP_NUMBER` | Twilio WhatsApp number | For WhatsApp |
| `SNIPPE_API_KEY` | Snippe secret API key | For hosted M-Pesa/mobile money checkout |
| `SNIPPE_WEBHOOK_SECRET` | Snippe webhook signing secret | For payment webhooks |
| `SNIPPE_BASE_URL` | Snippe API base URL (`https://api.snippe.sh`) | Optional |

### Step 4: Set up a database

You need a PostgreSQL database accessible from Vercel. Recommended options:

- **[Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)** — Built into Vercel, easiest setup
- **[Supabase](https://supabase.com)** — Free tier, great for getting started
- **[Neon](https://neon.tech)** — Serverless Postgres, generous free tier
- **[Railway](https://railway.app)** — Simple setup, pay-as-you-go

After creating your database, copy the connection string into the `DATABASE_URL` environment variable.

### Step 5: Deploy

Click **Deploy**. Vercel will build and deploy automatically.

After deployment, run the Prisma migration against your production database:

```bash
npx prisma db push
```

### WhatsApp Webhook (optional)

To enable the WhatsApp bot in production:

1. In Twilio console, set your WhatsApp webhook URL to:
   ```
   https://your-domain.vercel.app/api/whatsapp
   ```
2. Set the method to **POST**

## Database Commands

```bash
npx prisma generate        # Generate Prisma client
npx prisma db push          # Push schema to database
npx prisma migrate dev      # Create a migration
npx prisma studio           # Open database GUI
npm run db:seed             # Seed sample data
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| GET/POST | `/api/orders` | List / create orders |
| GET/PUT | `/api/orders/[id]` | Get / update order |
| GET/POST | `/api/products` | List / create products |
| GET | `/api/suppliers` | List suppliers |
| POST | `/api/payments` | Process payment |
| GET/POST | `/api/credit` | Credit line management |
| POST | `/api/whatsapp` | WhatsApp webhook |
| GET | `/api/dashboard/stats` | Dashboard analytics |

## License

MIT
