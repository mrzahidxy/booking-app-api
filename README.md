# 🏨 Booking Platform API

![Version 1](https://img.shields.io/badge/Version-1-blue?style=for-the-badge)

Version 1 release of the Gontobbo booking platform API.

A TypeScript + Express backend for the hotel and restaurant booking platform. It powers search, booking, payments, notifications, and admin workflows for the Next.js client. The API uses PostgreSQL with Prisma ORM and exposes the REST endpoints consumed by the frontend.

---

## 🚀 Features

- 🔐 JWT authentication with role and permission management
- 🏨 CRUD management for hotels, rooms, and restaurants
- 📅 Booking flow with room quantity tracking and booking status updates
- 💳 Stripe payment processing with checkout and webhook handling
- 🔔 Notification service with Firebase integration
- 📸 Cloudinary uploads for hotel, restaurant, and gallery images
- 🛡️ Zod validation with shared success and error response helpers
- 📘 Swagger documentation at `/api/docs`

---

## 🛠️ Tech Stack

- **Runtime**: Node.js, Express, TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Storage**: Cloudinary
- **Payments**: Stripe
- **Notifications**: Firebase Admin SDK
- **Validation**: Zod
- **Logging**: Winston
- **Docs**: Swagger UI / OpenAPI

---

## ✅ Prerequisites

- Node.js 20+
- PostgreSQL 14+ or a compatible hosted database
- Stripe account and webhook secret for payment flows
- Cloudinary credentials for media uploads
- Firebase service account JSON for push notifications

---

## 🚀 Getting Started

```bash
cd api
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

For a production run, build first and then start the compiled server:

```bash
npm run build
npm start
```

---

## 🔐 Environment Variables

Documented in [`.env.example`](./.env.example):

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | Optional runtime mode used by the app, defaults to `development` |
| `DATABASE_URL` | Prisma connection string for the pooled database |
| `DIRECT_URL` | Direct database connection used for migrations |
| `PORT` | API port, defaults to `8000` |
| `JWT_SECRET` | Secret used to sign JWT access tokens |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `STRIPE_PAYMENT_SECRET_KEY` | Stripe secret key used to create payment sessions |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret used to verify webhook requests |
| `FRONTEND_DOMAIN` | Frontend origin used for redirects after payment actions |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Base64 encoded Firebase service account JSON for notifications |

---

## 🗃️ Database & Prisma

- `npm run prisma:generate` regenerates the Prisma client.
- `npm run prisma:migrate` runs local development migrations.
- `npm run prisma:deploy` applies migrations in production.
- `npm run prisma:push` syncs the schema without migrations.

---

## 🌱 Seed Data

`npm run seed` seeds:

- Default roles and permissions
- Admin, staff, and user accounts
- Baseline data needed for the booking flow

Update the seeded credentials before using this in a real environment.

---

## 📚 NPM Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the API with Nodemon |
| `npm run build` | Compiles the TypeScript source to `dist/` |
| `npm run prestart` | Runs `npm run build` before `npm start` |
| `npm run start` | Starts the compiled server from `dist/server.js` |
| `npm run postinstall` | Runs Prisma generate and build after install |
| `npm run prisma:generate` | Generates the Prisma client |
| `npm run prisma:migrate` | Runs Prisma migrate dev |
| `npm run prisma:deploy` | Runs Prisma migrate deploy |
| `npm run prisma:push` | Pushes the schema directly to the database |
| `npm run seed` | Seeds the database |

---

## 🚀 Deployment

The API now uses a Docker-based GitHub Actions workflow at [`.github/workflows/docker-publish.yml`](./.github/workflows/docker-publish.yml).

- Pushes to `main` build and push the image to Docker Hub.
- Manual runs are also supported.
- The published image tags are `latest` and the commit SHA.
- The container expects the same runtime environment variables listed above, so your VPS should provide them when running the image.

---

## 📘 API Documentation

Swagger UI is available at `http://localhost:8000/api/docs`.

The raw OpenAPI JSON is available at `http://localhost:8000/api/docs.json`.

---

## 📄 License

MIT © [Your Name or Organization]
