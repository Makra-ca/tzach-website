# Video Categories — Design Spec

**Date:** 2026-06-02
**Status:** Approved (pending spec review)

## Overview

Add admin-managed **categories** for videos. Videos can belong to **multiple** categories (many-to-many). The admin manages categories in a new "Categories" sub-tab inside the existing Videos tab, and links videos to categories via a multi-select picker on the video form. The public `/videos` page gains a row of category **filter pills** that replace the current All/Videos/Audio media toggle.

## Goals

- Admin can create, rename, reorder, and delete categories
- Admin can assign a video to zero or more categories
- Public visitors filter the video grid by category (single grid, click a pill to narrow)
- Keep the codebase clean: split the growing Videos admin into focused components

## Non-Goals (YAGNI)

- Per-category description, color, or image (name + order only)
- Category detail pages / dedicated routes per category (filtering is client-side on one page)
- Nested / hierarchical categories
- Retaining the All/Videos/Audio media toggle (removed; an "Audio" category covers the need if desired)

## Data Model

New Prisma model and an implicit many-to-many relation with `Video`:

```prisma
model Category {
  id        String   @id @default(cuid())
  name      String
  order     Int      @default(0)
  videos    Video[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Video {
  // ...existing fields unchanged...
  categories Category[]
}
```

- Prisma's implicit m-n creates and manages the join table automatically.
- `order` drives both the admin list order and the public pill order.
- Deleting a `Category` removes its join rows only; videos are never deleted.

## Admin

### Structure
`VideosTab` becomes a thin container with two sub-tabs: **Videos** | **Categories**. This keeps the dashboard's tab pattern intact while splitting concerns into focused components.

- `VideosManager` — the existing video list + add/edit form (extracted from today's `VideosTab`)
- `CategoriesManager` — new component for the Categories sub-tab

### CategoriesManager (Categories sub-tab)
- Header: "Categories (N)"
- Add row: text input + "+ Add" button
- List rows, each: ▲▼ reorder arrows, name, live video-count badge, edit (✎), delete (🗑)
- Delete shows a confirm modal (reuses the shared `setConfirmModal` pattern); on confirm it unlinks and removes the category
- Edit is inline or a small modal to rename

### Video form (in VideosManager)
- Adds a **multi-select category picker** rendered as tag chips: selected categories show as removable chips, plus an "add category" affordance listing available categories
- On submit, the form sends `categoryIds: string[]` alongside the existing fields

### API routes (new)
- `GET /api/admin/categories` — list categories ordered by `order`, each with `_count.videos`
- `POST /api/admin/categories` — create `{ name }` (order = max+1)
- `PUT /api/admin/categories/[id]` — rename `{ name }`
- `DELETE /api/admin/categories/[id]` — delete (Prisma disconnects join rows automatically)
- `PUT /api/admin/categories/reorder` — `{ categoryIds: string[] }`, assigns sequential `order`

### API routes (modified)
- `POST /api/admin/videos` and `PUT /api/admin/videos/[id]` accept `categoryIds: string[]` and use Prisma `connect` / `set` to sync the relation. Validation: ignore unknown IDs; empty array is allowed.

All routes verify the session via `verifySession()` and call `revalidatePath('/', 'layout')` after mutations, consistent with existing handlers.

## Public `/videos`

### Data
The page server component fetches:
- Videos (matching the existing "ready" filter — Mux processing videos still hidden) **including their `categories`**
- All categories ordered by `order`

### UI
- A centered **filter pill row**: `[All]` + one pill per category (in `order`)
- Active pill: navy fill, gold count; inactive: white with border — same visual language as today's filter
- The All/Videos/Audio media toggle is **removed**
- Client-side filtering: selecting a category shows only videos linked to it; "All" shows everything
- Empty-per-filter state is unreachable as long as pills only render for categories that have ≥1 ready video (compute counts from the fetched videos and only show non-empty pills, plus All)

### Rendering / caching
No change to strategy — page stays static with on-demand revalidation. Admin category and video mutations call `revalidatePath('/', 'layout')`.

## Edge Cases

- **Category with zero ready videos:** its pill is hidden on the public page (no dead filters), but it still appears in admin.
- **Video with no categories:** shows only under "All".
- **Deleting a category that's the active public filter:** after revalidation the pill disappears; client falls back to "All" if the selected category no longer exists.
- **Renaming/reordering:** reflected on next revalidation.
- **Many-to-many sync on edit:** use `set` (replace) semantics so removing a chip removes the link.

## Files

**New**
- `app/components/admin/CategoriesManager.tsx`
- `app/components/admin/VideosManager.tsx` (extracted from current VideosTab)
- `app/api/admin/categories/route.ts`
- `app/api/admin/categories/[id]/route.ts`
- `app/api/admin/categories/reorder/route.ts`

**Modified**
- `prisma/schema.prisma` (Category model + Video.categories)
- `app/components/admin/VideosTab.tsx` (becomes sub-tab container)
- `app/components/admin/types.ts` (Category type, props)
- `app/api/admin/videos/route.ts` and `[id]/route.ts` (categoryIds)
- `app/admin/dashboard/page.tsx` (fetch + pass categories)
- `app/components/AdminDashboard.tsx` (categories state)
- `app/videos/page.tsx` (include categories, fetch category list)
- `app/components/VideosPageClient.tsx` (category pills, remove media toggle)

## Testing / Verification

- Create/rename/reorder/delete categories in admin; confirm counts update
- Assign multiple categories to a video; confirm chips persist on reload
- Public page: pills filter correctly; deleting a category removes its pill after revalidation
- A video in two categories appears under both pills and under All
- `npx tsc --noEmit` clean; production build succeeds
