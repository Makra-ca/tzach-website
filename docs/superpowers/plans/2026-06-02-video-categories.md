# Video Categories Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add admin-managed categories that videos can be tagged into (many-to-many), with a Categories sub-tab in the admin and category filter pills on the public /videos page.

**Architecture:** New `Category` Prisma model with an implicit many-to-many relation to `Video`. The admin "Videos" tab becomes a container with two sub-tabs (Videos | Categories) backed by focused components. Categories and video↔category links are managed through new/extended API routes. The public page derives category pills from the fetched videos and filters client-side.

**Tech Stack:** Next.js 16 (App Router), Prisma 5 + Neon PostgreSQL, Tailwind CSS 4. No test framework exists in this repo — verification is `npx tsc --noEmit` plus manual checks, matching the established pattern.

**Spec:** `docs/superpowers/specs/2026-06-02-video-categories-design.md`

**Conventions in this repo (follow exactly):**
- Every admin API route calls `await verifySession()` (from `@/lib/auth`) and returns 401 if false.
- After any mutation, call `revalidatePath('/', 'layout')` (from `next/cache`).
- Dynamic route handlers receive `{ params }: { params: Promise<{ id: string }> }` and `await params`.
- Reorder precedent: `app/api/admin/gallery/reorder/route.ts`.

---

## Chunk 1: Data model + API routes

### Task 1: Add Category model and Video relation

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add the `Category` model** at the end of `prisma/schema.prisma`:

```prisma
model Category {
  id        String   @id @default(cuid())
  name      String
  order     Int      @default(0)
  videos    Video[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([order])
}
```

- [ ] **Step 2: Add the relation field to the existing `Video` model.** Insert `categories Category[]` among its fields:

```prisma
model Video {
  id            String   @id @default(cuid())
  title         String
  description   String?
  mediaType     String   @default("url")
  videoUrl      String?
  embedUrl      String?
  muxUploadId   String?
  muxPlaybackId String?
  categories    Category[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

- [ ] **Step 3: Push schema and regenerate client**

Run: `npx prisma db push && npx prisma generate`
Expected: "Your database is now in sync" + "Generated Prisma Client". Prisma creates the implicit join table automatically.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "Add Category model with many-to-many relation to Video"
```

---

### Task 2: Categories CRUD + reorder API routes

**Files:**
- Create: `app/api/admin/categories/route.ts`
- Create: `app/api/admin/categories/[id]/route.ts`
- Create: `app/api/admin/categories/reorder/route.ts`

- [ ] **Step 1: Create `app/api/admin/categories/route.ts`** (list + create):

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/auth'

export async function GET() {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json(categories)
}

export async function POST(request: NextRequest) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { name } = await request.json()
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    const max = await prisma.category.aggregate({ _max: { order: true } })
    const category = await prisma.category.create({
      data: { name: name.trim(), order: (max._max.order ?? -1) + 1 },
    })
    revalidatePath('/', 'layout')
    return NextResponse.json(category)
  } catch (error) {
    console.error('Category create error:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create `app/api/admin/categories/[id]/route.ts`** (rename + delete):

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    const { name } = await request.json()
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    const category = await prisma.category.update({
      where: { id },
      data: { name: name.trim() },
    })
    revalidatePath('/', 'layout')
    return NextResponse.json(category)
  } catch (error) {
    console.error('Category update error:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    // Implicit m-n: deleting the category removes its join rows automatically.
    await prisma.category.delete({ where: { id } })
    revalidatePath('/', 'layout')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Category delete error:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Create `app/api/admin/categories/reorder/route.ts`** (mirror the gallery reorder pattern):

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/auth'

export async function PUT(request: NextRequest) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { categoryIds } = await request.json()
    if (!Array.isArray(categoryIds)) {
      return NextResponse.json({ error: 'categoryIds must be an array' }, { status: 400 })
    }
    await prisma.$transaction(
      categoryIds.map((id: string, index: number) =>
        prisma.category.update({ where: { id }, data: { order: index } })
      )
    )
    revalidatePath('/', 'layout')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Category reorder error:', error)
    return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 })
  }
}
```

- [ ] **Step 4: Verify and commit**

Run: `npx tsc --noEmit` → expect no errors.

```bash
git add app/api/admin/categories
git commit -m "Add categories CRUD and reorder API routes"
```

---

### Task 3: Extend videos API to sync categories and return them

**Files:**
- Modify: `app/api/admin/videos/route.ts`
- Modify: `app/api/admin/videos/[id]/route.ts`

- [ ] **Step 1: In `app/api/admin/videos/route.ts`**, make the GET include categories and the POST accept `categoryIds`.

In `GET`, change the query to:
```typescript
const videos = await prisma.video.findMany({
  orderBy: { createdAt: 'desc' },
  include: { categories: true },
})
```

In `POST`, read `categoryIds` from the body and attach it to each `prisma.video.create` call. After the existing destructure `const { title, description, mediaType } = body`, add:
```typescript
const categoryIds: string[] = Array.isArray(body.categoryIds) ? body.categoryIds : []
```
Then build a shared connect object and add it to every `create` data + add `include` to every `create` call. For each of the three `prisma.video.create({ data: { ...base, ... } })` calls, change them to:
```typescript
const video = await prisma.video.create({
  data: { ...base, /* existing type-specific fields */, categories: { connect: categoryIds.map((id) => ({ id })) } },
  include: { categories: true },
})
```
(Apply to the `url`, `mux`, and `audio` branches — each keeps its own type-specific fields, all gain `categories.connect` and `include`.)

- [ ] **Step 2: In `app/api/admin/videos/[id]/route.ts`**, make PUT sync categories with `set` and return them.

In the `PUT` handler, after building `data` (the `Prisma.VideoUpdateInput`), add category syncing when provided:
```typescript
if (Array.isArray(body.categoryIds)) {
  data.categories = { set: body.categoryIds.map((id: string) => ({ id })) }
}
```
Change the `prisma.video.update(...)` call to include categories:
```typescript
const video = await prisma.video.update({
  where: { id },
  data,
  include: { categories: true },
})
```

- [ ] **Step 3: Verify and commit**

Run: `npx tsc --noEmit` → expect no errors.

```bash
git add app/api/admin/videos/route.ts "app/api/admin/videos/[id]/route.ts"
git commit -m "Sync and return video categories in videos API"
```

---

## Chunk 2: Admin UI

### Task 4: Wire categories through dashboard state

**Files:**
- Modify: `app/components/admin/types.ts`
- Modify: `app/admin/dashboard/page.tsx`
- Modify: `app/components/AdminDashboard.tsx`

- [ ] **Step 1: Add a shared `VideoWithCategories` type to `app/components/admin/types.ts`:**

```typescript
import type { Video, Category } from '@prisma/client'

export type VideoWithCategories = Video & { categories: Category[] }
```
(Add the import alongside the existing `import type { Dispatch, SetStateAction } from 'react'`.)

- [ ] **Step 2: In `app/admin/dashboard/page.tsx`**, fetch categories and include them on videos.

Replace the `videos` query with:
```typescript
const videos = await prisma.video.findMany({
  orderBy: { createdAt: 'desc' },
  include: { categories: true },
})

const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } })
```
Add `categories` to the returned object, destructure it in `DashboardPage`, and pass `initialCategories={categories}` to `<AdminDashboard ... />`.

- [ ] **Step 3: In `app/components/AdminDashboard.tsx`**, thread categories through.

- Add `Category` to the prisma import and `VideoWithCategories` to the types import.
- Change `initialVideos: Video[]` → `initialVideos: VideoWithCategories[]` and add `initialCategories: Category[]` to `Props`.
- Add the prop to the destructure and add state: `const [categories, setCategories] = useState(initialCategories)`.
- Pass the new props to VideosTab:
```tsx
{activeTab === 'videos' && (
  <VideosTab
    videoItems={videoItems}
    setVideoItems={setVideoItems}
    categories={categories}
    setCategories={setCategories}
    {...tabCommonProps}
  />
)}
```

- [ ] **Step 4: Verify and commit**

Run: `npx tsc --noEmit` → expect errors ONLY in `VideosTab.tsx` (props not yet accepted) — that's fine, the next task fixes it. If errors appear elsewhere, fix them.

```bash
git add app/components/admin/types.ts app/admin/dashboard/page.tsx app/components/AdminDashboard.tsx
git commit -m "Thread categories through admin dashboard state"
```

---

### Task 5: Split VideosTab into a sub-tab container + VideosManager

**Files:**
- Create: `app/components/admin/VideosManager.tsx`
- Modify (becomes container): `app/components/admin/VideosTab.tsx`

- [ ] **Step 1: Create `app/components/admin/VideosManager.tsx`** by moving the ENTIRE current contents of `VideosTab.tsx` into it, renaming the component `export default function VideosManager`. Update its `Props` interface to use `VideoWithCategories` and to receive `categories`:

```typescript
interface Props extends CommonTabProps {
  videoItems: VideoWithCategories[]
  setVideoItems: Dispatch<SetStateAction<VideoWithCategories[]>>
  categories: Category[]
}
```
Also:
- Add `import type { Category } from '@prisma/client'` and `import type { VideoWithCategories } from './types'`. The old `import type { Video } from '@prisma/client'` can be removed (it's only used in the props/handler types below).
- Change the `handleEditVideo` parameter type from `(video: Video)` to `(video: VideoWithCategories)` — otherwise Task 7's `video.categories.map(...)` is a tsc error.
- Destructure the new `categories` prop in the component signature.

Leave the existing behavior intact — the category picker is added in Task 7.

- [ ] **Step 2: Replace `app/components/admin/VideosTab.tsx`** with a thin sub-tab container:

```tsx
'use client'

import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { Category } from '@prisma/client'
import type { CommonTabProps, VideoWithCategories } from './types'
import VideosManager from './VideosManager'
import CategoriesManager from './CategoriesManager'

interface Props extends CommonTabProps {
  videoItems: VideoWithCategories[]
  setVideoItems: Dispatch<SetStateAction<VideoWithCategories[]>>
  categories: Category[]
  setCategories: Dispatch<SetStateAction<Category[]>>
}

export default function VideosTab({ videoItems, setVideoItems, categories, setCategories, ...common }: Props) {
  const [sub, setSub] = useState<'videos' | 'categories'>('videos')

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(['videos', 'categories'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setSub(key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              sub === key ? 'bg-[#1e3a5f] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {key === 'videos' ? `Videos (${videoItems.length})` : `Categories (${categories.length})`}
          </button>
        ))}
      </div>

      {sub === 'videos' ? (
        <VideosManager videoItems={videoItems} setVideoItems={setVideoItems} categories={categories} {...common} />
      ) : (
        <CategoriesManager
          categories={categories}
          setCategories={setCategories}
          videoItems={videoItems}
          {...common}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit** (CategoriesManager is created next; tsc will fail until Task 6 — acceptable mid-chunk):

```bash
git add app/components/admin/VideosManager.tsx app/components/admin/VideosTab.tsx
git commit -m "Split Videos admin into sub-tab container and VideosManager"
```

---

### Task 6: Build CategoriesManager

**Files:**
- Create: `app/components/admin/CategoriesManager.tsx`

- [ ] **Step 1: Create `app/components/admin/CategoriesManager.tsx`:**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Dispatch, SetStateAction } from 'react'
import type { Category } from '@prisma/client'
import type { CommonTabProps, VideoWithCategories } from './types'

interface Props extends CommonTabProps {
  categories: Category[]
  setCategories: Dispatch<SetStateAction<Category[]>>
  videoItems: VideoWithCategories[]
}

export default function CategoriesManager({
  categories, setCategories, videoItems, showToast, setConfirmModal, setConfirmLoading, closeConfirmModal,
}: Props) {
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const router = useRouter()

  const countFor = (categoryId: string) =>
    videoItems.filter((v) => v.categories.some((c) => c.id === categoryId)).length

  const handleAdd = async () => {
    if (!newName.trim()) return
    setAdding(true)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })
      if (!res.ok) throw new Error('Failed to add category')
      const created = await res.json()
      setCategories((prev) => [...prev, created])
      setNewName('')
      router.refresh()
      showToast('Category added', 'success')
    } catch {
      showToast('Failed to add category', 'error')
    } finally {
      setAdding(false)
    }
  }

  const handleRename = async (id: string) => {
    if (!editName.trim()) { setEditingId(null); return }
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() }),
      })
      if (!res.ok) throw new Error('Failed')
      const updated = await res.json()
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)))
      setEditingId(null)
      router.refresh()
      showToast('Category renamed', 'success')
    } catch {
      showToast('Failed to rename', 'error')
    }
  }

  const move = async (from: number, to: number) => {
    if (to < 0 || to >= categories.length) return
    const next = [...categories]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setCategories(next)
    try {
      await fetch('/api/admin/categories/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryIds: next.map((c) => c.id) }),
      })
      router.refresh()
    } catch {
      setCategories(categories)
    }
  }

  const handleDelete = (id: string, name: string) => {
    const used = countFor(id)
    setConfirmModal({
      isOpen: true,
      title: 'Delete Category',
      message: `Delete "${name}"? ${used > 0 ? `It will be removed from ${used} video(s) — the videos are kept.` : ''}`,
      onConfirm: async () => {
        setConfirmLoading(true)
        try {
          const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
          if (!res.ok) throw new Error('Failed')
          setCategories((prev) => prev.filter((c) => c.id !== id))
          router.refresh()
          closeConfirmModal()
          showToast('Category deleted', 'success')
        } catch {
          closeConfirmModal()
          showToast('Failed to delete category', 'error')
        }
      },
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories ({categories.length})</h3>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="New category name…"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newName.trim()}
          className="px-5 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition-colors font-medium text-sm disabled:opacity-50"
        >
          + Add
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No categories yet.</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {categories.map((cat, index) => (
            <div key={cat.id} className="flex items-center gap-3 py-3">
              <div className="flex flex-col text-gray-300">
                <button onClick={() => move(index, index - 1)} disabled={index === 0} className="hover:text-[#1e3a5f] disabled:opacity-30 leading-none text-xs">▲</button>
                <button onClick={() => move(index, index + 1)} disabled={index === categories.length - 1} className="hover:text-[#1e3a5f] disabled:opacity-30 leading-none text-xs">▼</button>
              </div>
              {editingId === cat.id ? (
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => handleRename(cat.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRename(cat.id); if (e.key === 'Escape') setEditingId(null) }}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded"
                />
              ) : (
                <span className="flex-1 font-medium text-gray-900">{cat.name}</span>
              )}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">{countFor(cat.id)} videos</span>
              <button onClick={() => { setEditingId(cat.id); setEditName(cat.name) }} className="p-2 text-gray-400 hover:text-[#1e3a5f]" title="Rename">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </button>
              <button onClick={() => handleDelete(cat.id, cat.name)} className="p-2 text-gray-400 hover:text-red-600" title="Delete">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify and commit**

Run: `npx tsc --noEmit` → expect no errors (Task 5's container now resolves).

```bash
git add app/components/admin/CategoriesManager.tsx
git commit -m "Add CategoriesManager with add, rename, reorder, delete"
```

---

### Task 7: Category picker (chips) on the video form

**Files:**
- Modify: `app/components/admin/VideosManager.tsx`

- [ ] **Step 1: Add selected-category state.** In the form state, track selected category IDs. Add near the other `useState` calls:
```typescript
const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
```

- [ ] **Step 2: Seed it when opening the form.** In the "add" handler set it to `[]`; in the "edit" handler set it from the video:
```typescript
// add handler:
setSelectedCategoryIds([])
// edit handler (where the video is available):
setSelectedCategoryIds(video.categories.map((c) => c.id))
```

- [ ] **Step 3: Send it on submit.** In the create payload and the edit payload object, add:
```typescript
categoryIds: selectedCategoryIds,
```

- [ ] **Step 4: Render the chip picker** inside the form modal, after the Description field:
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
          <button
            type="button"
            key={cat.id}
            onClick={() =>
              setSelectedCategoryIds((prev) =>
                on ? prev.filter((id) => id !== cat.id) : [...prev, cat.id]
              )
            }
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              on ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
            }`}
          >
            {cat.name}
          </button>
        )
      })}
    </div>
  )}
</div>
```

- [ ] **Step 5: Show category chips on each video row** (optional but specified) — under the title/url line in the list, render the linked category names:
```tsx
{video.categories.length > 0 && (
  <div className="flex flex-wrap gap-1 mt-1">
    {video.categories.map((c) => (
      <span key={c.id} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{c.name}</span>
    ))}
  </div>
)}
```

- [ ] **Step 6: Verify and commit**

Run: `npx tsc --noEmit` → expect no errors. Manually: open the video form, confirm chips toggle and persist after save + reload; confirm the Categories tab count badges update when a video is assigned.

```bash
git add app/components/admin/VideosManager.tsx
git commit -m "Add category chip picker to the video form"
```

---

## Chunk 3: Public page

### Task 8: Include categories on videos + fetch ordered category list

**Files:**
- Modify: `app/videos/page.tsx`

- [ ] **Step 1: Add `include: { categories: true }`** to the existing `prisma.video.findMany` call (keep the existing `where` filter that hides processing Mux videos and the `orderBy`):
```typescript
const videos = await prisma.video.findMany({
  where: { /* existing OR filter unchanged */ },
  include: { categories: true },
  orderBy: { createdAt: 'desc' },
})
```

- [ ] **Step 2: Fetch the ordered category list** (so the public pills follow the admin's `order`, per the spec) and pass it to the client:
```typescript
const categories = await prisma.category.findMany({
  orderBy: { order: 'asc' },
  select: { id: true, name: true },
})

return <VideosPageClient videos={videos} categories={categories} />
```

- [ ] **Step 3: Verify and commit**

Run: `npx tsc --noEmit` → expect an error in `VideosPageClient` (its props/`VideoItem` not updated yet) — fixed in Task 9. If other errors, fix them.

```bash
git add app/videos/page.tsx
git commit -m "Include categories on public videos query and pass ordered list"
```

---

### Task 9: Category filter pills on the public page (remove media toggle)

**Files:**
- Modify: `app/components/VideosPageClient.tsx`

- [ ] **Step 1: Update the component's props and the `VideoItem` interface.**

Add `categories` to `VideoItem`:
```typescript
categories: { id: string; name: string }[]
```
Add a `categories` prop (the ordered list from the server) to `Props`:
```typescript
interface Props {
  videos: VideoItem[]
  categories: { id: string; name: string }[]
}
```
Update the component signature to `export default function VideosPageClient({ videos, categories }: Props)`.

- [ ] **Step 2: Replace the media-type filter with category filtering.**
- Remove the `Filter` type, the module-level `isAudio` helper, the `audioCount`/`videoCount` logic, the `showFilter` flag, the All/Videos/Audio `tabs` array, and its pill row.
- Replace with category filtering that respects the server `order` and only shows non-empty categories:
```typescript
const [activeCategory, setActiveCategory] = useState<string>('all')

const countFor = (id: string) => videos.filter((v) => v.categories.some((c) => c.id === id)).length

// Server already sorted `categories` by admin order; keep only those with ≥1 ready video.
const visibleCategories = categories.filter((c) => countFor(c.id) > 0)

// Guard: if the active category disappeared after a revalidation, fall back to All.
const activeExists = activeCategory === 'all' || visibleCategories.some((c) => c.id === activeCategory)
const effectiveActive = activeExists ? activeCategory : 'all'

const visible = effectiveActive === 'all'
  ? videos
  : videos.filter((v) => v.categories.some((c) => c.id === effectiveActive))
```

- Render the pill row only when there's at least one non-empty category, with the gold count (mirrors the old filter's styling):
```tsx
{visibleCategories.length > 0 && (
  <div className="flex flex-wrap justify-center gap-2 mb-12">
    {[{ id: 'all', name: 'All', count: videos.length }, ...visibleCategories.map((c) => ({ ...c, count: countFor(c.id) }))].map((c) => (
      <button
        key={c.id}
        onClick={() => setActiveCategory(c.id)}
        className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
          effectiveActive === c.id
            ? 'bg-[#0f172a] text-white'
            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
        }`}
      >
        {c.name}
        <span className={`ml-1.5 ${effectiveActive === c.id ? 'text-[#d4a853]' : 'text-gray-400'}`}>{c.count}</span>
      </button>
    ))}
  </div>
)}
```
- Render the grid from `visible` (the existing `.map` over the filtered list — keep the card markup exactly as is).

**Note:** the `MediaRenderer` component and per-card markup are unchanged — only the filter bar and the filtered list change. Pills now follow the admin `order` because the server passes `categories` already sorted by `order`.

- [ ] **Step 3: Verify and commit**

Run: `npx tsc --noEmit` → expect no errors. Manually: load `/videos`, confirm pills appear only when categories exist, filter works, a multi-category video appears under each of its pills and under All.

```bash
git add app/components/VideosPageClient.tsx
git commit -m "Replace media toggle with category filter pills on /videos"
```

---

## Final verification

- [ ] **Run:** `npx tsc --noEmit` → no errors
- [ ] **Run:** `npm run build` → succeeds (Neon must be awake)
- [ ] Manual smoke test per the spec's Testing / Verification section
