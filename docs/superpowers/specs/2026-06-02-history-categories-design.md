# History Categories — Design Spec

**Date:** 2026-06-02
**Status:** Approved

## Overview

Add admin-managed categories for **History items**, structurally identical to the Videos categories feature (`docs/superpowers/specs/2026-06-02-video-categories-design.md`) but with a **separate** model so History and Videos categories are independent. A history item can belong to multiple categories. The admin manages them in a new "Categories" sub-tab inside the History tab; the public `/history` page gains category filter pills.

## Goals

- Admin can create, rename, reorder, delete History categories (independent of Video categories)
- Admin can tag a history item with zero or more categories
- Public `/history` visitors filter the grid by category (pills)
- Seed the 17 client-provided category names as History categories

## Non-Goals (YAGNI)

- Sharing categories between Videos and History (explicitly chosen to keep them separate)
- Per-category description/color/image (name + order only)
- Category detail routes (client-side filtering on one page)
- Changing the Videos category feature in any way (it stays as built)

## Data Model

New model + implicit many-to-many with `HistoryItem` (separate from the Videos `Category`):

```prisma
model HistoryCategory {
  id        String        @id @default(cuid())
  name      String
  order     Int           @default(0)
  items     HistoryItem[]
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  @@index([order])
}

model HistoryItem {
  // ...existing fields unchanged...
  categories HistoryCategory[]
}
```

- Implicit m-n; no `onDelete` config needed (Prisma cascades join rows).
- `order` drives admin list order and public pill order.
- Deleting a category unlinks items only; items are never deleted.
- Name validation: trim + reject empty; duplicates allowed (no unique constraint).

## Admin (mirrors VideosTab)

- `HistoryTab` becomes a thin container with two sub-tabs: **Items** | **Categories**.
- `HistoryItemsManager` — the existing history list + add/edit forms (extracted from today's `HistoryTab`).
- `HistoryCategoriesManager` — new; add row, list with ▲▼ reorder, **client-derived** count badge, rename, delete-with-confirm. Reuses the bug-fixed patterns from `CategoriesManager` (Escape cancels, no double-submit, snapshot rollback, in-flight guard).
- The history item add/edit forms get a multi-select category chip picker; send `categoryIds` on both create and edit.
- New API routes: `/api/admin/history-categories` (GET/POST), `/api/admin/history-categories/[id]` (PUT/DELETE), `/api/admin/history-categories/reorder` (PUT).
- History item create/update accept `categoryIds`, sync via `connect`/`set`, **filter to existing ids** (the bug-fix lesson), and `include: { categories: true }` on every read/write that feeds the admin list.
- All routes verify session + `revalidatePath('/', 'layout')`.

## Public `/history`

- `app/history/page.tsx` includes categories on items and fetches the ordered category list (`orderBy: [{ order: 'asc' }, { createdAt: 'asc' }]`), passing both to `HistoryPageClient`.
- `HistoryPageClient` adds a centered filter pill row above the grid: `[All]` + one pill per category that has ≥1 item, in server order, with a count (gold on active). Only renders when ≥1 non-empty category. Client-side filtering; deleted-active-category falls back to All. The existing grid + lightbox are unchanged.

## Seed

After the schema is live, seed the 17 names as `HistoryCategory` rows in order:
Early Years; Uforatzta Magazine; Pegishos – Encounter with Chabad; Annual Convention - Sukkos; Annual Beis Iyar Farbrengen; Levi Yitzchok Library; Mivtza Teffilin; Communities visits to Crown Heights; Visitation Programs (to communities & campuses); Tahalucha; Mivtza Chinuch/Year of Education; The Matzah Ball Contest; Mivtza Purim; Mivtza Chanuka; Mivtza Mezuza; Mitzva Tanks; Duchos.

## Files

**New:** `HistoryCategoriesManager.tsx`, `HistoryItemsManager.tsx`, `app/api/admin/history-categories/{route,[id]/route,reorder/route}.ts`
**Modified:** `prisma/schema.prisma`, `HistoryTab.tsx` (→ sub-tab container), `app/components/admin/types.ts` (HistoryItemWithCategories), `app/api/admin/history/{route,[id]/route}.ts` (categoryIds), `app/admin/dashboard/page.tsx` (fetch + pass), `AdminDashboard.tsx` (state), `app/history/page.tsx`, `app/components/HistoryPageClient.tsx`.

## Testing / Verification

- `npx prisma db push && npx prisma generate`
- Create/rename/reorder/delete History categories; counts update
- Tag a history item with multiple categories; chips persist on reload
- `/history`: pills filter correctly; deleting a category removes its pill; items survive
- `npx tsc --noEmit` clean; build succeeds
