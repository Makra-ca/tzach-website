# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tzach is a Lubavitch Youth Organization (LYO) directory application for finding Chabad Houses in the NYC Metro area, Long Island, and Westchester. It's a Next.js 16 full-stack application with PostgreSQL database.

## Commands

```bash
npm run dev      # Start dev server on port 3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint check
npm run seed     # Seed database from Excel files (prisma/seed.ts)
```

Prisma commands:
```bash
npx prisma generate    # Generate Prisma client after schema changes
npx prisma db push     # Push schema changes to database
npx prisma studio      # Open database GUI
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (Neon) with Prisma 5 ORM
- **Auth**: Custom JWT sessions in httpOnly cookies (24h expiry)
- **Styling**: Tailwind CSS 4
- **Fonts**: Geist + Cormorant Garamond (display)

## Architecture

### Data Flow
- Server components fetch from Prisma, pass data to client components
- Client components handle interactive filtering/search
- Admin operations go through authenticated API routes
- All admin API endpoints verify JWT session before processing

### Key Directories
- `app/api/admin/` - Protected CRUD endpoints (chabad-houses, colleges)
- `app/components/` - React components (DirectoryClient, AdminDashboard, CollegesClient)
- `lib/auth.ts` - JWT session management (createSession, verifySession, destroySession)
- `lib/db.ts` - Prisma singleton
- `prisma/schema.prisma` - Database models

### Database Models
- **ChabadHouse** - Main entity (rabbi info, location, contact, county)
- **College** - Campus with optional link to ChabadHouse via chabadId
- **Service** - Offerings with ordering
- **TeamMember** - Staff/board with deceased tracking
- **SiteSettings** - Admin password hash, global config

### Theme Colors
- Primary: `#0f172a` (navy)
- Accent: `#d4a853` (gold)
- Admin UI uses `#1e3a5f` (darker blue)

## Environment Variables

```
DATABASE_URL=postgresql://...  # Neon PostgreSQL connection
ADMIN_PASSWORD=...             # Hashed during seed
JWT_SECRET=...                 # Optional, has default for dev
```

## Key Patterns

- Homepage uses `force-dynamic` to bypass caching
- Path alias: `@/*` maps to project root
- Excel data files in `/public` are imported during seed
- Admin dashboard uses tabs for Chabad Houses vs Colleges management

## Recent Changes

### 2026-01-28: Preloader responsive layout improvements
- **Files modified**: `app/components/Preloader.tsx`
- Changed side-by-side layout breakpoint from `lg` (1024px) to `sm` (640px) so tablet-sized screens show Rebbe image alongside content
- Added scroll indicator with IntersectionObserver that appears when CTA buttons are below the fold
- Indicator positioned at center dividing line between image and content sections
