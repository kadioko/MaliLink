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

# M-Pesa Payments (optional)
MPESA_CONSUMER_KEY=""
MPESA_CONSUMER_SECRET=""
MPESA_PASSKEY=""
MPESA_SHORTCODE=""
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
| `TWILIO_ACCOUNT_SID` | Twilio account SID | For WhatsApp |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | For WhatsApp |
| `TWILIO_WHATSAPP_NUMBER` | Twilio WhatsApp number | For WhatsApp |
| `MPESA_CONSUMER_KEY` | M-Pesa API key | For payments |
| `MPESA_CONSUMER_SECRET` | M-Pesa API secret | For payments |
| `MPESA_PASSKEY` | M-Pesa passkey | For payments |
| `MPESA_SHORTCODE` | M-Pesa shortcode | For payments |

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
