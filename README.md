<div align="center">

# 📅 CalFinal

**A modern booking and scheduling application**

Built with Next.js, Prisma, PostgreSQL, and Tailwind CSS — inspired by the simplicity of Cal.com.

[**🚀 Live Demo**](https://scheduler-v2-six.vercel.app/)

</div>

---

## ✨ Overview

CalFinal is a full-stack scheduling platform that lets users create event types, manage availability, and let others book time with them — without the back-and-forth of email scheduling. Built on the Next.js App Router with a Prisma + PostgreSQL backend, it's designed to be fast, type-safe, and easy to self-host.

## 🔑 Key Features

- 🗓️ **Event Type Management** — Create and customize bookable event types with configurable durations and questions
- ⏰ **Availability Management** — Define working hours and time-slot availability per user
- 🔐 **Google OAuth Authentication** — Secure sign-in powered by NextAuth
- 📊 **Dashboard Experience** — Responsive, reusable UI components for managing bookings, event types, and settings
- ⚡ **Modern Stack** — Next.js 16 App Router, server-side API routes, and Prisma ORM for type-safe database access
- ☁️ **Production-Ready Deployment** — Pre-configured for one-click deployment on Vercel

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Database | PostgreSQL |
| ORM | [Prisma](https://www.prisma.io/) v7 with `@prisma/adapter-pg` |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Auth | [NextAuth](https://authjs.dev/) (Google OAuth) |
| Package Manager | [pnpm](https://pnpm.io/) |
| Language | TypeScript |
| Deployment | [Vercel](https://vercel.com/) |

## 📁 Repository Structure

```
├── app/          # Next.js pages, layouts, and API routes
├── components/   # UI and dashboard components
├── lib/          # Shared utilities, Prisma client, and booking helpers
├── prisma/       # Prisma schema and migrations
├── public/       # Static assets
└── styles/       # Global styles
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (or a compatible runtime)
- [pnpm](https://pnpm.io/installation) package manager
- A PostgreSQL database (e.g. [Neon](https://neon.tech), [Railway](https://railway.app), or local Postgres)

### Local Setup

**1. Clone the repository**
```bash
git clone https://github.com/ajeetkartikay/scheduler-v2.git
cd scheduler-v2
```

**2. Install dependencies**
```bash
pnpm install
```

**3. Set up environment variables**
```bash
cp .env.example .env
```

Update `.env` with your actual values:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
AUTH_SECRET=your_generated_secret
AUTH_URL=http://localhost:3000
```

**4. Approve required build scripts (if prompted)**
```bash
pnpm approve-builds
```

**5. Generate the Prisma client**
```bash
npx prisma generate
```

**6. Push the database schema**
```bash
npx prisma db push
```

**7. Run the development server**
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. 🎉

## 📜 Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Run the development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run ESLint |

## ☁️ Deployment

CalFinal is configured for seamless deployment on [Vercel](https://vercel.com):

1. Import this repository into Vercel
2. Add the required environment variables in **Project Settings → Environment Variables**:
   - `DATABASE_URL`
   - `AUTH_GOOGLE_ID`
   - `AUTH_GOOGLE_SECRET`
   - `AUTH_SECRET`
   - `AUTH_URL` (your production URL, e.g. `https://your-app.vercel.app`)
3. Update your Google OAuth client's **Authorized redirect URIs** to include:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```
4. Build command: `pnpm build` · Output: handled automatically by Next.js

> If using Railway or another managed PostgreSQL provider, use their provided connection string for `DATABASE_URL`.

## 📝 Notes

- This project uses **Prisma v7** and requires the PostgreSQL adapter (`@prisma/adapter-pg`)
- Never commit your `.env` file — keep secrets local
- Use `.env.example` as the template for required environment variables

## 📄 License

This repository is provided as-is. Update this section if you add formal licensing terms.

---

<div align="center">

Built by [Ajeet Kumar](https://github.com/ajeetkartikay)

</div>