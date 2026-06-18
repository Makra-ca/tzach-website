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
- **File storage**: Vercel Blob (client-side uploads via `@vercel/blob/client`)
- **Video hosting**: Mux (`@mux/mux-node` server-side, `@mux/mux-player-react` client-side)

## Architecture

### Data Flow
- Server components fetch from Prisma, pass data to client components
- Client components handle interactive filtering/search
- Admin operations go through authenticated API routes
- All admin API endpoints verify JWT session before processing

### Key Directories
- `app/api/admin/` - Protected CRUD endpoints (chabad-houses, colleges, gallery, hero, history, videos, upload)
- `app/components/admin/` - Per-tab admin components (GalleryTab, VideosTab, HistoryTab, etc.)
- `app/components/` - Public-facing client components (DirectoryClient, AdminDashboard, CollegesClient)
- `lib/auth.ts` - JWT session management (createSession, verifySession, destroySession)
- `lib/db.ts` - Prisma singleton
- `lib/videoEmbed.ts` - Converts YouTube/Vimeo URLs to iframe embed URLs
- `prisma/schema.prisma` - Database models

### Admin Dashboard Pattern
The admin is a single page (`app/admin/dashboard/page.tsx`) that fetches all data server-side and passes it to `AdminDashboard` (client component). `AdminDashboard` manages tab state and delegates to per-tab components in `app/components/admin/`. Each tab receives its data slice + shared helpers (`showToast`, `setConfirmModal`) via props — defined in `app/components/admin/types.ts`.

### File Upload Pattern
All file uploads use Vercel Blob client-side upload (`@vercel/blob/client`):
1. Client calls `upload(filename, file, { handleUploadUrl: '/api/admin/upload' })`
2. `/api/admin/upload` generates a signed token (verifies session, sets allowed MIME types/size)
3. File goes directly from browser to Vercel Blob — never through your server
4. Client saves the returned Blob URL to the database via a separate API call

### Mux Video Upload Pattern (in progress)
MP4 videos use Mux direct upload:
1. Client calls `POST /api/admin/mux-upload` → server creates Mux upload URL
2. Client PUTs file directly to Mux URL (XHR for progress tracking)
3. `muxUploadId` saved to DB immediately; `muxPlaybackId` is null while Mux processes
4. Mux calls `POST /api/mux/webhook` (`video.asset.ready` event) → server sets `muxPlaybackId` automatically and revalidates. This is what makes uploaded videos appear on the public site without manual action.
5. `GET /api/admin/mux-upload/[uploadId]` is a manual fallback — the admin "Check Status" button uses it to force-resolve the playback ID
6. Public page uses `<MuxPlayer playbackId={...} />` from `@mux/mux-player-react`; shows a "Processing…" spinner while `muxPlaybackId` is null

**Mux setup required:** In the Mux dashboard, add a webhook pointing to `https://<your-domain>/api/mux/webhook` and copy its signing secret into `MUX_WEBHOOK_SECRET`. Without this, videos upload but never auto-publish (admin must click "Check Status" per video).

### Database Models
- **ChabadHouse** - Main entity (rabbi info, location, contact, county, lat/lng)
- **College** - Campus with optional link to ChabadHouse via `chabadId`
- **Service** - Homepage service offerings with ordering
- **TeamMember** - Staff/board with `isDeceased` and `isBoard` flags
- **SiteSettings** - Single row (`id: "main"`), stores admin bcrypt hash
- **GalleryImage** - Vercel Blob URLs with ordering (homepage gallery)
- **HeroImage** - Per-page hero images (`page` field: homepage/directory/colleges/headquarters)
- **HeadquartersProgram** - Programs shown on headquarters page with categories
- **HistoryItem** - Historical images/PDFs (`fileType`: "image" | "pdf")
- **Video** - Supports three `mediaType` values: `"url"` (YouTube/Vimeo), `"mux"` (direct upload), `"audio"` (MP3 via Blob)

### Theme Colors
- Primary: `#0f172a` (navy)
- Accent: `#d4a853` (gold)
- Admin UI uses `#1e3a5f` (darker blue)

## Environment Variables

```
DATABASE_URL=postgresql://...     # Neon PostgreSQL connection
ADMIN_PASSWORD=...                # Hashed during seed
JWT_SECRET=...                    # Optional, has default for dev
BLOB_READ_WRITE_TOKEN=...         # Vercel Blob (set automatically on Vercel)
MUX_TOKEN_ID=...                  # Mux API token ID
MUX_TOKEN_SECRET=...              # Mux API token secret
MUX_WEBHOOK_SECRET=...            # Mux webhook signing secret (for /api/mux/webhook)
RESEND_API_KEY=...                # Resend API key (registration form emails)
REGISTRATION_TO=...               # Recipient inbox for registration signups (comma-separated allowed)
REGISTRATION_FROM=...             # Verified sender, e.g. "Tzach <noreply@domain.org>"; falls back to onboarding@resend.dev
```

## Key Patterns

- Public pages use on-demand revalidation (`revalidatePath('/', 'layout')` called from admin API routes after any mutation)
- Path alias: `@/*` maps to project root
- Excel data files in `/public` are imported during seed
- Admin session verified on every API route via `verifySession()` from `lib/auth.ts` — returns boolean
- `revalidatePath` is called after every admin mutation to keep public pages fresh without force-dynamic

## Recent Changes

### 2026-06-18: Registration form (Tzach Shluchos Recharge)
- **Files**: `app/register/page.tsx`, `app/components/RegisterForm.tsx`, `app/api/register/route.ts`
- Standalone `/register` page (not in nav). Fields: Name, Makom haShlichus, Email, WhatsApp #, Lunch/Dinner checkboxes (independent — can pick both)
- Email-only via Resend (`await`-ed send, `replyTo` = registrant email). No DB storage, no admin list.
- Server-side re-validates required fields + email format. Recipient/sender from env (`REGISTRATION_TO`, `REGISTRATION_FROM`); returns 500 if `RESEND_API_KEY`/`REGISTRATION_TO` unset.
- **TODO before launch**: fill `RESEND_API_KEY`, `REGISTRATION_TO`, `REGISTRATION_FROM` in `.env.local` (and Vercel). Sender domain must be verified in Resend or it falls back to `onboarding@resend.dev`.

### 2026-05-20: Mux video + audio upload (in progress)
- **Plan**: `docs/superpowers/plans/2026-05-20-mux-video-audio-upload.md`
- Adding `mediaType`, `muxUploadId`, `muxPlaybackId` fields to `Video` model
- Admin `VideosTab` gets type selector: URL / Upload Video (Mux) / Upload Audio (Blob)
- Public `/videos` page renders Mux player, `<audio>` tag, or iframe based on `mediaType`

### 2026-01-28: Preloader responsive layout improvements
- **Files modified**: `app/components/Preloader.tsx`
- Changed side-by-side layout breakpoint from `lg` (1024px) to `sm` (640px) so tablet-sized screens show Rebbe image alongside content
- Added scroll indicator with IntersectionObserver that appears when CTA buttons are below the fold
