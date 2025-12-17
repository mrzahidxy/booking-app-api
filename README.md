# 🏨 Booking App API

A TypeScript + Express backend that powers the Booking App experience. It exposes guarded REST endpoints for hotels, restaurants, rooms, bookings, payments, and notifications, using PostgreSQL via Prisma ORM. This repo contains only the API layer; the Next.js client consumes these endpoints.

---

## 🚀 Features

- 🔐 JWT authentication with role & permission management seeded via Prisma
- 🏨 CRUD management for hotels, rooms, and restaurant catalogues with amenities & rich descriptions
- 📅 Booking flow with room quantity tracking, guest counts, and review management
- 📸 Cloudinary uploads for hotel/restaurant/gallery images
- 💳 Stripe Checkout & webhook handling for payment intents and receipts
- 🔔 Notification service integrated with Firebase Cloud Messaging
- 🛡️ Centralized validation using Zod and consistent error/success response helpers
- 📘 Interactive Swagger documentation served from `/api/docs`

---

## 🛠️ Tech Stack

- **Runtime**: Node.js, Express, TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **File Storage**: Cloudinary
- **Payments**: Stripe Checkout & webhooks
- **Messaging**: Firebase Admin SDK
- **Validation & Tooling**: Zod, dotenv, Winston logger, Swagger UI

---

## ✅ Prerequisites

- Node.js 20+
- PostgreSQL 14+ (local instance or a managed service such as Supabase)
- Stripe account & webhook secret for end-to-end payments (optional for local dev)
- Cloudinary & Firebase credentials if you want media uploads + push notifications locally

---

## 🚀 Getting Started

```bash
git clone https://github.com/your-username/booking-app-api.git
cd booking-app-api
cp .env.example .env              # Update the values before running
npm install
npm run prisma:generate           # Generates Prisma client
npm run prisma:migrate            # Apply dev migrations
npm run seed                      # Creates default roles, permissions & users
npm run dev                       # Starts the server on http://localhost:8000
```

For a production-like run, execute `npm run build` followed by `npm start` (which will serve the transpiled output from `dist/`).

---

## 🔐 Environment Variables

| Variable | What it controls |
| --- | --- |
| `DATABASE_URL` | Connection string Prisma uses at runtime (can point to pooled Supabase URL) |
| `DIRECT_URL` | Direct connection for running migrations (non-pooled) |
| `PORT` | API port, defaults to `8000` |
| `JWT_SECRET` | Secret used to sign and verify JWT access tokens |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Credentials for media uploads |
| `STRIPE_PAYMENT_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Server key for creating Checkout sessions and validating webhooks |
| `FRONTEND_DOMAIN` | URL that should receive post-payment redirects |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Base64 encoded Firebase service account used to send push notifications |

Refer to `.env.example` for the latest list and placeholders.

---

## 🗃️ Database & Prisma

- `npm run prisma:migrate` – runs `prisma migrate dev` locally.
- `npm run prisma:deploy` – applies migrations in production.
- `npm run prisma:push` – syncs the schema without migrations (useful for quick prototyping).
- `npm run prisma:generate` – regenerates the Prisma client (also executed on `postinstall`).

---

## 🌱 Seed Data

`npm run seed` populates:

- Base permissions & default `Admin`, `Staff`, and `User` roles.
- An admin user → `admin@example.com` / `Password@123`.
- A standard user → `user@example.com` / `Password@123`.

Change passwords immediately in real environments.

---

## 📚 Useful NPM Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the TypeScript server with Nodemon |
| `npm run build` | Emits JavaScript to `dist/` |
| `npm start` | Runs the compiled server |
| `npm run seed` | Executes `prisma/seed.ts` |
| `npm run prisma:*` | Namespaced helpers from `package.json` (generate/migrate/deploy/push) |

---

## 📘 API Documentation

Swagger UI is exposed at `http://localhost:8000/api/docs` and always reflects the current schema defined in `src/docs/swagger.ts`. The raw OpenAPI JSON can be downloaded from `/api/docs.json`, which is useful for Postman collections or client generation.

---

## 📄 License

MIT © [Your Name or Organization]
