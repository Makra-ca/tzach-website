# History Categories Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add admin-managed categories (separate from Video categories) that history items can be tagged into, with a Categories sub-tab in the History admin and category filter pills on the public `/history` page.

**Architecture:** New `HistoryCategory` Prisma model with an implicit many-to-many to `HistoryItem`. The History tab becomes a container with two sub-tabs (Items | Categories). This is a structural mirror of the just-completed Videos categories feature — reuse those proven, bug-fixed files with precise substitutions rather than writing from scratch.

**Tech Stack:** Next.js 16 App Router, Prisma 5 + Neon, Tailwind 4. No test framework — verify with `npx tsc --noEmit` + manual checks.

**Spec:** `docs/superpowers/specs/2026-06-02-history-categories-design.md`

**Reference implementation (copy these, don't reinvent):** the Videos feature uses `app/components/admin/CategoriesManager.tsx`, `app/components/admin/VideosManager.tsx`, `app/components/admin/VideosTab.tsx`, `app/api/admin/categories/*`, and `app/components/VideosPageClient.tsx`. These already contain the reviewed bug fixes (Escape cancels rename, no double-submit, snapshot reorder rollback + in-flight guard, server-side id filtering, client-derived counts, include-categories-everywhere). Mirror them.

**Conventions:** every admin route `await verifySession()` → 401; `revalidatePath('/', 'layout')` after mutations; dynamic routes `await params`; `prisma` from `@/lib/db`. Commits look human-written (no AI attribution).

---

## Chunk 1: Data model + API routes

### Task 1: Add HistoryCategory model + HistoryItem relation

**Files:** Modify `prisma/schema.prisma`

- [ ] **Step 1:** Add `categories HistoryCategory[]` to the existing `HistoryItem` model, and append the new model:

```prisma
model HistoryItem {
  id         String            @id @default(cuid())
  title      String
  fileUrl    String
  fileType   String
  categories HistoryCategory[]
  createdAt  DateTime          @default(now())
}

model HistoryCategory {
  id        String        @id @default(cuid())
  name      String
  order     Int           @default(0)
  items     HistoryItem[]
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  @@index([order])
}
```

- [ ] **Step 2:** `npx prisma db push && npx prisma generate` → expect "in sync" + "Generated Prisma Client". If Neon is asleep, retry once.
- [ ] **Step 3:** Commit `prisma/schema.prisma` — "Add HistoryCategory model with many-to-many relation to HistoryItem".

---

### Task 2: history-categories CRUD + reorder routes

**Files:** Create `app/api/admin/history-categories/route.ts`, `app/api/admin/history-categories/[id]/route.ts`, `app/api/admin/history-categories/reorder/route.ts`

- [ ] **Step 1:** Copy the three files from `app/api/admin/categories/` to `app/api/admin/history-categories/` and apply substitutions in all three:
  - `prisma.category` → `prisma.historyCategory`
  - keep everything else identical (validation, order = max+1, `$transaction` reorder, `verifySession`, `revalidatePath`).

  For reference, `route.ts` should be:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/auth'

export async function GET() {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const categories = await prisma.historyCategory.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json(categories)
}

export async function POST(request: NextRequest) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { name } = await request.json()
    if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    const max = await prisma.historyCategory.aggregate({ _max: { order: true } })
    const category = await prisma.historyCategory.create({ data: { name: name.trim(), order: (max._max.order ?? -1) + 1 } })
    revalidatePath('/', 'layout')
    return NextResponse.json(category)
  } catch (error) {
    console.error('History category create error:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
```
  `[id]/route.ts` (PUT rename, DELETE) and `reorder/route.ts` mirror `app/api/admin/categories/[id]/route.ts` and `app/api/admin/categories/reorder/route.ts` with `prisma.historyCategory`.

- [ ] **Step 2:** `npx tsc --noEmit` → clean. Commit — "Add history-categories CRUD and reorder API routes".

---

### Task 3: history items API — sync + return categories

**Files:** Modify `app/api/admin/history/route.ts` and `app/api/admin/history/[id]/route.ts`

- [ ] **Step 1:** In `history/route.ts`:
  - `GET`: add `include: { categories: true }` to the `findMany`.
  - `POST`: read `categoryIds`, filter to existing, connect, include. Replace the create block:
```typescript
const { title, fileUrl, fileType } = body
const requestedCategoryIds: string[] = Array.isArray(body.categoryIds) ? body.categoryIds : []
// ...existing title/fileUrl/fileType validation unchanged...
const categoryIds = requestedCategoryIds.length
  ? (await prisma.historyCategory.findMany({ where: { id: { in: requestedCategoryIds } }, select: { id: true } })).map((c) => c.id)
  : []
const item = await prisma.historyItem.create({
  data: { title: title.trim(), fileUrl, fileType, categories: { connect: categoryIds.map((id) => ({ id })) } },
  include: { categories: true },
})
```
  (Change `const { title, fileUrl, fileType } = await request.json()` to `const body = await request.json()` first, then destructure from `body`.)

- [ ] **Step 2:** In `history/[id]/route.ts` PUT, apply these exact changes (do NOT add a second `await request.json()` — the body stream can only be read once):
  1. Add `import type { Prisma } from '@prisma/client'` at the top.
  2. Replace `const { title, fileUrl, fileType } = await request.json()` with:
```typescript
const body = await request.json()
const { title, fileUrl, fileType } = body
```
  3. Change `const updateData: Record<string, string> = { title: title.trim() }` to:
```typescript
const updateData: Prisma.HistoryItemUpdateInput = { title: title.trim() }
```
  4. After the existing `if (fileUrl && fileType) { ... }` block, add:
```typescript
if (Array.isArray(body.categoryIds)) {
  const validIds = body.categoryIds.length
    ? (await prisma.historyCategory.findMany({ where: { id: { in: body.categoryIds } }, select: { id: true } })).map((c) => c.id)
    : []
  updateData.categories = { set: validIds.map((id) => ({ id })) }
}
```
  5. Add `include: { categories: true }` to the `prisma.historyItem.update(...)` call.
  Leave the existing DELETE handler (with `del(item.fileUrl)`) unchanged.

- [ ] **Step 3:** `npx tsc --noEmit` → clean. Commit — "Sync and return history item categories in history API".

---

## Chunk 2: Admin UI

### Task 4: Thread history categories through dashboard state

**Files:** Modify `app/components/admin/types.ts`, `app/admin/dashboard/page.tsx`, `app/components/AdminDashboard.tsx`

- [ ] **Step 1:** In `types.ts` add:
```typescript
import type { Video, Category, HistoryItem, HistoryCategory } from '@prisma/client'
export type VideoWithCategories = Video & { categories: Category[] }
export type HistoryItemWithCategories = HistoryItem & { categories: HistoryCategory[] }
```
(Merge with the existing `VideoWithCategories` import line — don't duplicate.)

- [ ] **Step 2:** In `app/admin/dashboard/page.tsx`: change the `history` query to `include: { categories: true }`, add `const historyCategories = await prisma.historyCategory.findMany({ orderBy: { order: 'asc' } })`, return both, destructure, and pass `initialHistoryCategories={historyCategories}` to `<AdminDashboard>`.

- [ ] **Step 3:** In `AdminDashboard.tsx`:
  - On the `@prisma/client` import line (line 4), **remove `HistoryItem`** (it becomes unused) and add `HistoryCategory`. Add `HistoryItemWithCategories` to the `./admin/types` import.
  - Change `initialHistory: HistoryItem[]` → `HistoryItemWithCategories[]`; add `initialHistoryCategories: HistoryCategory[]` to Props and the destructure.
  - Add `const [historyCategories, setHistoryCategories] = useState(initialHistoryCategories)`.
  - **Replace** the existing `{activeTab === 'history' && (...)}` block (do not append a duplicate) with:
```tsx
{activeTab === 'history' && (
  <HistoryTab
    historyItems={historyItems}
    setHistoryItems={setHistoryItems}
    categories={historyCategories}
    setCategories={setHistoryCategories}
    {...tabCommonProps}
  />
)}
```

- [ ] **Step 4:** `npx tsc --noEmit` → expect errors only in HistoryTab (props not accepted yet) — fixed next task. Commit — "Thread history categories through admin dashboard state".

---

### Task 5: Split HistoryTab into container + HistoryItemsManager

**Files:** Create `app/components/admin/HistoryItemsManager.tsx`; replace `app/components/admin/HistoryTab.tsx`

- [ ] **Step 1:** Move the ENTIRE current contents of `HistoryTab.tsx` into a new `HistoryItemsManager.tsx`, renaming the component to `HistoryItemsManager`. Update its Props to use `HistoryItemWithCategories` and receive `categories`:
```typescript
interface Props extends CommonTabProps {
  historyItems: HistoryItemWithCategories[]
  setHistoryItems: Dispatch<SetStateAction<HistoryItemWithCategories[]>>
  categories: HistoryCategory[]
}
```
Add imports `import type { HistoryCategory } from '@prisma/client'` and `import type { HistoryItemWithCategories } from './types'`; remove the old `HistoryItem` type import if now unused. (Category picker added in Task 7.)

- [ ] **Step 2:** Replace `HistoryTab.tsx` with a sub-tab container — copy `app/components/admin/VideosTab.tsx` and substitute: `VideosManager`→`HistoryItemsManager`, `CategoriesManager`→`HistoryCategoriesManager`, `videoItems`→`historyItems`, `setVideoItems`→`setHistoryItems`, `VideoWithCategories`→`HistoryItemWithCategories`, labels `Videos`→`Items`. The two sub-tab keys become `'items' | 'categories'`. Keep the `setVideoItems` → `setHistoryItems` prop passed to the CategoriesManager (needed for the delete-strips-from-items fix). Result:
```tsx
'use client'
import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { HistoryCategory } from '@prisma/client'
import type { CommonTabProps, HistoryItemWithCategories } from './types'
import HistoryItemsManager from './HistoryItemsManager'
import HistoryCategoriesManager from './HistoryCategoriesManager'

interface Props extends CommonTabProps {
  historyItems: HistoryItemWithCategories[]
  setHistoryItems: Dispatch<SetStateAction<HistoryItemWithCategories[]>>
  categories: HistoryCategory[]
  setCategories: Dispatch<SetStateAction<HistoryCategory[]>>
}

export default function HistoryTab({ historyItems, setHistoryItems, categories, setCategories, ...common }: Props) {
  const [sub, setSub] = useState<'items' | 'categories'>('items')
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(['items', 'categories'] as const).map((key) => (
          <button key={key} onClick={() => setSub(key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              sub === key ? 'bg-[#1e3a5f] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            {key === 'items' ? `Items (${historyItems.length})` : `Categories (${categories.length})`}
          </button>
        ))}
      </div>
      {sub === 'items' ? (
        <HistoryItemsManager historyItems={historyItems} setHistoryItems={setHistoryItems} categories={categories} {...common} />
      ) : (
        <HistoryCategoriesManager categories={categories} setCategories={setCategories} historyItems={historyItems} setHistoryItems={setHistoryItems} {...common} />
      )}
    </div>
  )
}
```

- [ ] **Step 3:** Commit (tsc red until Task 6) — "Split History admin into sub-tab container and HistoryItemsManager".

---

### Task 6: Build HistoryCategoriesManager

**Files:** Create `app/components/admin/HistoryCategoriesManager.tsx`

- [ ] **Step 1:** Copy the bug-fixed `app/components/admin/CategoriesManager.tsx` to `HistoryCategoriesManager.tsx` and apply substitutions:
  - Component name `CategoriesManager` → `HistoryCategoriesManager`
  - Type `Category` → `HistoryCategory` (import from `@prisma/client`)
  - `VideoWithCategories` → `HistoryItemWithCategories` (import from `./types`)
  - Props `videoItems`/`setVideoItems` → `historyItems`/`setHistoryItems`
  - API path `/api/admin/categories` → `/api/admin/history-categories` (all four fetch calls: add, rename, reorder, delete)
  - `countFor` filters `historyItems` instead of `videoItems`
  - the delete-success strip: `setHistoryItems((prev) => prev.map((v) => ({ ...v, categories: v.categories.filter((c) => c.id !== id) })))`
  - user-facing copy: the count badge `{countFor(cat.id)} videos` → `{countFor(cat.id)} items`, and the delete-confirm message `...removed from ${used} video(s) — the videos are kept.` → `...removed from ${used} item(s) — the items are kept.`
  - Keep ALL the bug fixes intact (skipBlur ref, commitRename/cancelRename, reordering guard, snapshot rollback, handleAdd `if (adding) return`).

- [ ] **Step 2:** `npx tsc --noEmit` → clean. Commit — "Add HistoryCategoriesManager".

---

### Task 7: Category chip picker on the history item forms

**Files:** Modify `app/components/admin/HistoryItemsManager.tsx`

The history admin has TWO forms: the **Add** modal and the **Edit** modal. Both need the chip picker. Add form state and wire it into both.

- [ ] **Step 1:** Add state near the other `useState`s:
```typescript
const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
```

- [ ] **Step 2:** Seed it:
  - When opening the Add modal (the "+ Add Item" handler / `setShowHistoryForm(true)`): `setSelectedCategoryIds([])`.
  - In `handleOpenHistoryEdit(item)`: `setSelectedCategoryIds(item.categories.map((c) => c.id))`.

- [ ] **Step 3:** Send it:
  - In the Add upload flow (`uploadHistoryFile`, the POST to `/api/admin/history`): add `categoryIds: selectedCategoryIds` to the JSON body.
  - In `handleSubmitHistoryEdit` (the PUT body): add `categoryIds: selectedCategoryIds`.

- [ ] **Step 4:** Render the chip picker inside BOTH modals (after the file field, before the error line). Use the same markup as `VideosManager`'s picker:
```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
  {categories.length === 0 ? (
    <p className="text-xs text-gray-400">No categories yet — add some in the Categories tab.</p>
  ) : (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const on = selectedCategoryIds.includes(cat.id)
        return (
          <button type="button" key={cat.id}
            onClick={() => setSelectedCategoryIds((prev) => on ? prev.filter((id) => id !== cat.id) : [...prev, cat.id])}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              on ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
            }`}>
            {cat.name}
          </button>
        )
      })}
    </div>
  )}
</div>
```

- [ ] **Step 5:** Show category chips on each history row (under the title/badge), mirroring VideosManager:
```tsx
{item.categories.length > 0 && (
  <div className="flex flex-wrap gap-1 mt-1">
    {item.categories.map((c) => (
      <span key={c.id} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{c.name}</span>
    ))}
  </div>
)}
```

- [ ] **Step 6:** `npx tsc --noEmit` → clean. Commit — "Add category chip picker to history item forms".

---

## Chunk 3: Public page

### Task 8: Include categories on public history query + fetch ordered list

**Files:** Modify `app/history/page.tsx`

- [ ] **Step 1:**
```typescript
const items = await prisma.historyItem.findMany({
  include: { categories: true },
  orderBy: { createdAt: 'desc' },
})
const categories = await prisma.historyCategory.findMany({
  orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  select: { id: true, name: true },
})
return <HistoryPageClient items={items} categories={categories} />
```

- [ ] **Step 2:** `npx tsc --noEmit` → expect error in HistoryPageClient (props not updated) — fixed next. Commit — "Include categories on public history query and pass ordered list".

---

### Task 9: Category filter pills on /history

**Files:** Modify `app/components/HistoryPageClient.tsx`

- [ ] **Step 1:** Extend the `HistoryItem` interface with `categories: { id: string; name: string }[]` and add a `categories` prop to `Props`:
```typescript
interface Props {
  items: HistoryItem[]
  categories: { id: string; name: string }[]
}
```
Update the signature to `export default function HistoryPageClient({ items, categories }: Props)`.

- [ ] **Step 2:** Add filtering (mirror `VideosPageClient`), using `items` instead of `videos`:
```typescript
const [activeCategory, setActiveCategory] = useState<string>('all')
const countFor = (id: string) => items.filter((it) => it.categories.some((c) => c.id === id)).length
const visibleCategories = categories.filter((c) => countFor(c.id) > 0)
const activeExists = activeCategory === 'all' || visibleCategories.some((c) => c.id === activeCategory)
const effectiveActive = activeExists ? activeCategory : 'all'
const visible = effectiveActive === 'all' ? items : items.filter((it) => it.categories.some((c) => c.id === effectiveActive))
```
Keep the existing `activeItem` lightbox state.

- [ ] **Step 3:** Render the pill row inside the content container, just before the `{items.length === 0 ? ... }` block:
```tsx
{visibleCategories.length > 0 && (
  <div className="flex flex-wrap justify-center gap-2 mb-12">
    {[{ id: 'all', name: 'All', count: items.length }, ...visibleCategories.map((c) => ({ ...c, count: countFor(c.id) }))].map((c) => (
      <button key={c.id} onClick={() => setActiveCategory(c.id)}
        className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
          effectiveActive === c.id ? 'bg-[#0f172a] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
        }`}>
        {c.name}<span className={`ml-1.5 ${effectiveActive === c.id ? 'text-[#d4a853]' : 'text-gray-400'}`}>{c.count}</span>
      </button>
    ))}
  </div>
)}
```

- [ ] **Step 4:** Change the grid's `items.map(...)` to `visible.map(...)`. Keep the empty-state keyed on total `items.length`. The lightbox (`activeItem`) and PdfThumbnail are unchanged.

- [ ] **Step 5:** `npx tsc --noEmit` → clean. Commit — "Add category filter pills to /history".

---

## Final verification

- [ ] `npx tsc --noEmit` clean; `npm run build` succeeds (Neon awake)
- [ ] Manual: create/rename/reorder/delete history categories; tag an item with several; `/history` pills filter; multi-category item appears under each pill + All

## Seed (after build verified)

- [ ] Run a one-off script (like the prior `seed-categories.mjs`, but `prisma.historyCategory`) to create the 17 names in order, then delete the script. Idempotent (skip existing names).
