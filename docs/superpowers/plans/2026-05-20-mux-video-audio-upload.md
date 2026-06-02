# Mux Video + Audio Upload Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace URL-only video entry with direct MP4 upload via Mux and direct MP3 upload via Vercel Blob, while keeping the existing YouTube/Vimeo URL option.

**Architecture:** The `Video` model gets a `mediaType` field (`"url"` | `"mux"` | `"audio"`) plus `muxUploadId` and `muxPlaybackId` fields. MP4s are uploaded directly from the browser to Mux (server creates the upload URL, client sends the file). MP3s use the existing Vercel Blob client-upload pattern. The public page detects `mediaType` and renders a Mux player, `<audio>` tag, or existing iframe accordingly. Mux videos show a "Processing…" badge until `muxPlaybackId` is available; the admin panel polls for readiness.

**Tech Stack:** `@mux/mux-node` (server — create upload URLs, delete assets), `@mux/mux-player-react` (client — Mux playback), `@vercel/blob/client` (audio upload, already in use), Prisma + Neon PostgreSQL, Next.js 16 App Router.

---

## Chunk 1: Dependencies, env, schema

### Task 1: Install packages

**Files:**
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Install Mux packages**

```bash
cd /home/daniel/coding-work/Makra-work-files/tzach/tzach
npm install @mux/mux-node @mux/mux-player-react
```

Expected: both packages added to `node_modules` and `package.json`.

- [ ] **Step 2: Verify installs**

```bash
node -e "require('@mux/mux-node'); console.log('mux-node ok')"
node -e "require('@mux/mux-player-react'); console.log('mux-player-react ok')"
```

Expected: both print "ok".

- [ ] **Step 3: Add env vars to `.env.local`**

Open `.env.local` (or `.env`) and add:
```
MUX_TOKEN_ID=your_mux_token_id_here
MUX_TOKEN_SECRET=your_mux_token_secret_here
```

Get these from the Mux dashboard → Settings → API Access Tokens. Use "Mux Video" permissions (read + write).

Also add to Vercel project env vars (Settings → Environment Variables) for both Preview and Production.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add mux-node and mux-player-react dependencies"
```

---

### Task 2: Prisma schema — add mediaType, muxUploadId, muxPlaybackId to Video

**Files:**
- Modify: `prisma/schema.prisma` (Video model, lines ~107-117)

- [ ] **Step 1: Update Video model in schema**

Replace the existing `Video` model with:

```prisma
model Video {
  id            String   @id @default(cuid())
  title         String
  description   String?
  mediaType     String   @default("url")   // "url" | "mux" | "audio"
  videoUrl      String?  // YouTube/Vimeo URL (mediaType=url) or Blob URL (mediaType=audio)
  embedUrl      String?  // Computed iframe embed URL (mediaType=url only)
  muxUploadId   String?  // Mux upload ID (mediaType=mux, set immediately on upload)
  muxPlaybackId String?  // Mux playback ID (mediaType=mux, set after Mux processes asset)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

Note: `videoUrl` and `embedUrl` are now nullable (`String?`) to support mux and audio types.

- [ ] **Step 2: Push schema to database**

```bash
npx prisma db push
```

Expected: "Your database is now in sync with your Prisma schema."

- [ ] **Step 3: Regenerate Prisma client**

```bash
npx prisma generate
```

- [ ] **Step 4: Verify existing video records still work**

```bash
npx prisma studio
```

Open in browser, check Videos table — existing rows should have `mediaType = "url"` (default applied), `videoUrl` populated, `muxUploadId/muxPlaybackId` null.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add mediaType, muxUploadId, muxPlaybackId to Video model"
```

---

## Chunk 2: Backend API routes

### Task 3: Extend upload token handler to accept audio files

**Files:**
- Modify: `app/api/admin/upload/route.ts`

- [ ] **Step 1: Add audio MIME types to allowed list**

In `app/api/admin/upload/route.ts`, find the `allowedContentTypes` array and update it:

```typescript
return {
  allowedContentTypes: [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp',
    'application/pdf',
    'audio/mpeg',       // .mp3
    'audio/mp4',        // .m4a
    'audio/wav',
    'audio/ogg',
    'audio/aac',
  ],
  maximumSizeInBytes: 200 * 1024 * 1024, // 200MB (audio files can be large)
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/admin/upload/route.ts
git commit -m "feat: allow audio file uploads via Vercel Blob token handler"
```

---

### Task 4: Mux upload URL creation endpoint

**Files:**
- Create: `app/api/admin/mux-upload/route.ts`

This endpoint creates a Mux direct upload URL. The client gets this URL and PUTs the video file directly to Mux — no video data passes through your server.

- [ ] **Step 1: Create the route**

```typescript
// app/api/admin/mux-upload/route.ts
import { NextResponse } from 'next/server'
import Mux from '@mux/mux-node'
import { verifySession } from '@/lib/auth'

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
})

export async function POST() {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const upload = await mux.video.uploads.create({
      cors_origin: '*',
      new_asset_settings: {
        playback_policy: ['public'],
        mp4_support: 'capped-1080p',
      },
    })

    return NextResponse.json({
      uploadUrl: upload.url,
      uploadId: upload.id,
    })
  } catch (error) {
    console.error('Mux upload creation error:', error)
    return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/admin/mux-upload/route.ts
git commit -m "feat: add Mux direct upload URL creation endpoint"
```

---

### Task 5: Mux status poll endpoint

**Files:**
- Create: `app/api/admin/mux-upload/[uploadId]/route.ts`

After a video is uploaded to Mux, the admin panel polls this endpoint to check if Mux has finished processing and get the `playbackId`.

- [ ] **Step 1: Create the route**

```typescript
// app/api/admin/mux-upload/[uploadId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Mux from '@mux/mux-node'
import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ uploadId: string }> }
) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { uploadId } = await params

  try {
    const upload = await mux.video.uploads.retrieve(uploadId)

    if (upload.status === 'asset_created' && upload.asset_id) {
      const asset = await mux.video.assets.retrieve(upload.asset_id)
      const playbackId = asset.playback_ids?.[0]?.id ?? null

      if (playbackId) {
        // Update DB record with playback ID
        await prisma.video.updateMany({
          where: { muxUploadId: uploadId },
          data: { muxPlaybackId: playbackId },
        })
        revalidatePath('/', 'layout')
        return NextResponse.json({ status: 'ready', playbackId })
      }
    }

    return NextResponse.json({ status: upload.status, playbackId: null })
  } catch (error) {
    console.error('Mux status check error:', error)
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/api/admin/mux-upload/[uploadId]/route.ts"
git commit -m "feat: add Mux upload status poll endpoint"
```

---

### Task 6: Update Videos CRUD API for all three media types

**Files:**
- Modify: `app/api/admin/videos/route.ts`
- Modify: `app/api/admin/videos/[id]/route.ts`

- [ ] **Step 1: Update POST in `app/api/admin/videos/route.ts`**

Replace the existing POST handler body with:

```typescript
export async function POST(request: NextRequest) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, description, mediaType } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    if (!['url', 'mux', 'audio'].includes(mediaType)) {
      return NextResponse.json({ error: 'Invalid media type' }, { status: 400 })
    }

    let data: Record<string, unknown> = {
      title: title.trim(),
      description: description?.trim() || null,
      mediaType,
    }

    if (mediaType === 'url') {
      const { videoUrl } = body
      if (!videoUrl?.trim()) {
        return NextResponse.json({ error: 'Video URL is required' }, { status: 400 })
      }
      const embedUrl = getEmbedUrl(videoUrl.trim())
      data = { ...data, videoUrl: videoUrl.trim(), embedUrl }
    } else if (mediaType === 'mux') {
      const { muxUploadId } = body
      if (!muxUploadId?.trim()) {
        return NextResponse.json({ error: 'Mux upload ID is required' }, { status: 400 })
      }
      data = { ...data, muxUploadId: muxUploadId.trim() }
    } else if (mediaType === 'audio') {
      const { videoUrl } = body // blob URL stored in videoUrl field
      if (!videoUrl?.trim()) {
        return NextResponse.json({ error: 'Audio URL is required' }, { status: 400 })
      }
      data = { ...data, videoUrl: videoUrl.trim() }
    }

    const video = await prisma.video.create({ data })
    revalidatePath('/', 'layout')
    return NextResponse.json(video)
  } catch (error) {
    console.error('Video create error:', error)
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 })
  }
}
```

Also add the import at the top of the file (if not already present):
```typescript
import { getEmbedUrl } from '@/lib/videoEmbed'
```

- [ ] **Step 2: Update DELETE in `app/api/admin/videos/[id]/route.ts`**

Read the current file first, then update the DELETE handler to also delete the Mux asset if applicable:

```typescript
// Add Mux import at top
import Mux from '@mux/mux-node'

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
})
```

In the DELETE handler, after finding the video and before deleting from DB, add:

```typescript
// Delete Mux asset if applicable
if (video.muxUploadId) {
  try {
    const upload = await mux.video.uploads.retrieve(video.muxUploadId)
    if (upload.asset_id) {
      await mux.video.assets.delete(upload.asset_id)
    }
  } catch (err) {
    console.error('Failed to delete Mux asset (continuing):', err)
    // Don't block DB deletion if Mux delete fails
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/videos/route.ts "app/api/admin/videos/[id]/route.ts"
git commit -m "feat: update videos API to handle url/mux/audio media types"
```

---

## Chunk 3: Admin UI

### Task 7: Update VideosTab to support upload (MP4 + MP3) and URL modes

**Files:**
- Modify: `app/components/admin/VideosTab.tsx`

This is the largest change. The form gets a media type selector at the top, then conditionally shows URL input, MP4 file picker, or MP3 file picker.

- [ ] **Step 1: Add imports at the top**

```typescript
import { upload } from '@vercel/blob/client'
```

- [ ] **Step 2: Update `VideoFormData` type**

```typescript
type VideoFormData = {
  title: string
  description: string
  mediaType: 'url' | 'mux' | 'audio'
  videoUrl: string       // for 'url' and 'audio' types
  selectedFile: File | null  // for 'mux' and 'audio' uploads
}

const emptyVideoForm: VideoFormData = {
  title: '',
  description: '',
  mediaType: 'url',
  videoUrl: '',
  selectedFile: null,
}
```

- [ ] **Step 3: Add upload state variables**

Inside the component, add:

```typescript
const [uploadProgress, setUploadProgress] = useState(0) // 0-100 for Mux upload progress
const [muxPolling, setMuxPolling] = useState(false)
```

- [ ] **Step 4: Add `handleSubmitVideo` logic for all three types**

Replace the existing `handleSubmitVideo` with:

```typescript
const handleSubmitVideo = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!videoForm.title.trim()) { setError('Title is required'); return }
  setLoading(true)
  setError('')

  try {
    let payload: Record<string, unknown> = {
      title: videoForm.title.trim(),
      description: videoForm.description.trim() || null,
      mediaType: videoForm.mediaType,
    }

    if (videoForm.mediaType === 'url') {
      if (!videoForm.videoUrl.trim()) { setError('Video URL is required'); setLoading(false); return }
      payload.videoUrl = videoForm.videoUrl.trim()

    } else if (videoForm.mediaType === 'audio') {
      if (!videoForm.selectedFile) { setError('Please select an audio file'); setLoading(false); return }
      const blob = await upload(videoForm.selectedFile.name, videoForm.selectedFile, {
        access: 'public',
        handleUploadUrl: '/api/admin/upload',
      })
      payload.videoUrl = blob.url

    } else if (videoForm.mediaType === 'mux') {
      if (!videoForm.selectedFile) { setError('Please select a video file'); setLoading(false); return }

      // 1. Get Mux upload URL
      const urlRes = await fetch('/api/admin/mux-upload', { method: 'POST' })
      if (!urlRes.ok) throw new Error('Failed to get upload URL')
      const { uploadUrl, uploadId } = await urlRes.json()

      // 2. Upload file directly to Mux
      setUploadProgress(1)
      const xhr = new XMLHttpRequest()
      await new Promise<void>((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 95))
        }
        xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('Upload failed'))
        xhr.onerror = () => reject(new Error('Upload failed'))
        xhr.open('PUT', uploadUrl)
        xhr.send(videoForm.selectedFile)
      })
      setUploadProgress(100)
      payload.muxUploadId = uploadId
    }

    const url = editingVideoId ? `/api/admin/videos/${editingVideoId}` : '/api/admin/videos'
    const res = await fetch(url, {
      method: editingVideoId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('Failed to save video')
    const savedVideo = await res.json()

    if (editingVideoId) {
      setVideoItems(prev => prev.map(v => v.id === editingVideoId ? savedVideo : v))
      showToast('Video updated successfully', 'success')
    } else {
      setVideoItems(prev => [savedVideo, ...prev])
      showToast(
        videoForm.mediaType === 'mux'
          ? 'Video uploaded — processing may take a minute'
          : 'Added successfully',
        'success'
      )
    }
    handleCancelVideo()
    router.refresh()
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to save')
  } finally {
    setLoading(false)
    setUploadProgress(0)
  }
}
```

- [ ] **Step 5: Add `handleCheckMuxStatus` function**

```typescript
const handleCheckMuxStatus = async (video: Video) => {
  if (!video.muxUploadId) return
  setMuxPolling(true)
  try {
    const res = await fetch(`/api/admin/mux-upload/${video.muxUploadId}`)
    const data = await res.json()
    if (data.playbackId) {
      setVideoItems(prev => prev.map(v =>
        v.id === video.id ? { ...v, muxPlaybackId: data.playbackId } : v
      ))
      showToast('Video is ready!', 'success')
      router.refresh()
    } else {
      showToast('Still processing — try again in a moment', 'info')
    }
  } catch {
    showToast('Failed to check status', 'error')
  } finally {
    setMuxPolling(false)
  }
}
```

- [ ] **Step 6: Update the form modal UI**

In the form modal, add a media type selector ABOVE the title field:

```tsx
{/* Media Type Selector — only shown when adding (not editing) */}
{!editingVideoId && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
    <div className="grid grid-cols-3 gap-2">
      {[
        { value: 'url', label: 'YouTube / Vimeo', icon: '🔗' },
        { value: 'mux', label: 'Upload Video', icon: '🎬' },
        { value: 'audio', label: 'Upload Audio', icon: '🎵' },
      ].map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setVideoForm({ ...videoForm, mediaType: opt.value as 'url' | 'mux' | 'audio', videoUrl: '', selectedFile: null })}
          className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
            videoForm.mediaType === opt.value
              ? 'border-[#1e3a5f] bg-[#1e3a5f] text-white'
              : 'border-gray-300 text-gray-700 hover:border-gray-400'
          }`}
        >
          {opt.icon} {opt.label}
        </button>
      ))}
    </div>
  </div>
)}
```

Replace the existing URL input field section with conditional rendering:

```tsx
{/* URL input — only for 'url' type */}
{videoForm.mediaType === 'url' && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Video URL *</label>
    <input
      type="url"
      value={videoForm.videoUrl}
      onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
      placeholder="https://www.youtube.com/watch?v=..."
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
    />
    <p className="text-xs text-gray-400 mt-1">Supports YouTube and Vimeo links</p>
  </div>
)}

{/* File picker — for 'mux' (video) and 'audio' types */}
{(videoForm.mediaType === 'mux' || videoForm.mediaType === 'audio') && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {videoForm.mediaType === 'mux' ? 'Video File (MP4) *' : 'Audio File (MP3) *'}
    </label>
    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#1e3a5f] transition-colors">
      <input
        type="file"
        accept={videoForm.mediaType === 'mux' ? 'video/mp4,video/quicktime,video/*' : 'audio/mpeg,audio/mp4,audio/wav,audio/*'}
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null
          setVideoForm({ ...videoForm, selectedFile: file })
        }}
        className="hidden"
      />
      {videoForm.selectedFile ? (
        <div className="text-center px-4">
          <p className="text-sm font-medium text-[#1e3a5f] truncate">{videoForm.selectedFile.name}</p>
          <p className="text-xs text-gray-400 mt-1">{(videoForm.selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-sm text-gray-500">Click to select file</p>
          <p className="text-xs text-gray-400 mt-1">
            {videoForm.mediaType === 'mux' ? 'MP4, MOV, etc.' : 'MP3, WAV, M4A, etc.'}
          </p>
        </div>
      )}
    </label>
    {/* Upload progress bar */}
    {uploadProgress > 0 && uploadProgress < 100 && (
      <div className="mt-2">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1e3a5f] transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">Uploading… {uploadProgress}%</p>
      </div>
    )}
  </div>
)}
```

- [ ] **Step 7: Update the video list items to show media type badge + processing state**

In the list item rendering, replace the generic video icon placeholder with type-aware rendering:

```tsx
{/* Thumbnail / icon area */}
<div className="w-28 h-16 rounded-lg overflow-hidden bg-gray-900 shrink-0 flex items-center justify-center relative">
  {video.mediaType === 'mux' && video.muxPlaybackId ? (
    <img
      src={`https://image.mux.com/${video.muxPlaybackId}/thumbnail.jpg?time=0`}
      alt={video.title}
      className="w-full h-full object-cover"
    />
  ) : video.mediaType === 'audio' ? (
    <svg className="w-8 h-8 text-white/50" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    </svg>
  ) : (
    <svg className="w-8 h-8 text-white/50" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/>
    </svg>
  )}
  {/* Processing badge */}
  {video.mediaType === 'mux' && !video.muxPlaybackId && (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
      <span className="text-xs text-yellow-400 font-medium">Processing…</span>
    </div>
  )}
</div>
```

Add a "Check Status" button next to the edit/delete buttons for processing Mux videos:

```tsx
{video.mediaType === 'mux' && !video.muxPlaybackId && (
  <button
    onClick={() => handleCheckMuxStatus(video)}
    disabled={muxPolling}
    className="p-2 text-yellow-600 hover:text-yellow-700 transition-colors"
    title="Check processing status"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  </button>
)}
```

- [ ] **Step 8: Commit**

```bash
git add app/components/admin/VideosTab.tsx
git commit -m "feat: add MP4 (Mux) and MP3 (Blob) upload to admin VideosTab"
```

---

## Chunk 4: Public page rendering

### Task 8: Update public VideosPageClient to render Mux player and audio player

**Files:**
- Modify: `app/components/VideosPageClient.tsx`

- [ ] **Step 1: Add Mux player import**

At the top of `app/components/VideosPageClient.tsx`:

```typescript
import MuxPlayer from '@mux/mux-player-react'
```

- [ ] **Step 2: Update VideoItem interface**

```typescript
interface VideoItem {
  id: string
  title: string
  description: string | null
  mediaType: string
  embedUrl: string | null
  videoUrl: string | null
  muxPlaybackId: string | null
}
```

- [ ] **Step 3: Add a `MediaRenderer` helper component inside the file**

```tsx
function MediaRenderer({ video }: { video: VideoItem }) {
  if (video.mediaType === 'mux') {
    if (!video.muxPlaybackId) {
      return (
        <div className="aspect-video w-full bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2" />
            <p className="text-white/50 text-sm">Processing video…</p>
          </div>
        </div>
      )
    }
    return (
      <div className="aspect-video w-full bg-black">
        <MuxPlayer
          playbackId={video.muxPlaybackId}
          style={{ width: '100%', height: '100%' }}
          accentColor="#d4a853"
        />
      </div>
    )
  }

  if (video.mediaType === 'audio') {
    return (
      <div className="w-full bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] p-6 flex flex-col items-center justify-center gap-3" style={{ minHeight: '120px' }}>
        <svg className="w-10 h-10 text-[#d4a853]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
        <audio
          controls
          src={video.videoUrl ?? undefined}
          className="w-full max-w-sm"
          style={{ accentColor: '#d4a853' }}
        />
      </div>
    )
  }

  // Default: YouTube/Vimeo iframe
  return (
    <div className="aspect-video w-full bg-black">
      <iframe
        src={video.embedUrl ?? undefined}
        title={video.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full"
        style={{ border: 'none' }}
      />
    </div>
  )
}
```

- [ ] **Step 4: Use `MediaRenderer` in the video grid**

Replace the existing `<div className="aspect-video w-full bg-black"> <iframe .../>` block with:

```tsx
<MediaRenderer video={video} />
```

- [ ] **Step 5: Commit**

```bash
git add app/components/VideosPageClient.tsx
git commit -m "feat: render Mux player and audio player on public videos page"
```

---

## Chunk 5: Final wiring + verification

### Task 9: Update the videos page server component to pass new fields

**Files:**
- Modify: `app/videos/page.tsx`

The Prisma query already returns all fields, but verify the shape matches the updated `VideoItem` interface.

- [ ] **Step 1: Check `app/videos/page.tsx` passes the right fields**

The current query is:
```typescript
const videos = await prisma.video.findMany({ orderBy: { createdAt: 'desc' } })
```

This returns all fields including the new ones. No change needed — Prisma returns the full model. Confirm `VideosPageClient` receives `mediaType`, `muxPlaybackId`, `videoUrl` without modification.

- [ ] **Step 2: Check admin dashboard passes new fields to VideosTab**

Open `app/admin/dashboard/page.tsx` and verify videos are passed correctly. The Prisma query there also uses `findMany` with no field selection, so all new fields are included automatically. No change needed.

- [ ] **Step 3: Add `MUX_TOKEN_ID` and `MUX_TOKEN_SECRET` to Vercel environment variables**

```bash
vercel env add MUX_TOKEN_ID
vercel env add MUX_TOKEN_SECRET
```

Or add via Vercel dashboard → Project → Settings → Environment Variables.

- [ ] **Step 4: Test the full flow locally**

1. Start dev server: `npm run dev`
2. Go to admin → Videos tab
3. Add a video with "YouTube / Vimeo" — confirm existing flow still works
4. Add a video with "Upload Audio" — pick an MP3, confirm it uploads and plays
5. Add a video with "Upload Video" — pick a small MP4 (test file), confirm it uploads to Mux
6. Wait ~30 seconds, click "Check Status" — confirm `muxPlaybackId` is set
7. Go to `/videos` — confirm Mux player renders, audio player renders, iframe renders

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat: complete Mux video and audio upload integration"
```

---

## Environment Variables Summary

| Variable | Where to get it | Required for |
|---|---|---|
| `MUX_TOKEN_ID` | Mux dashboard → Settings → API Access Tokens | Mux uploads + playback |
| `MUX_TOKEN_SECRET` | Same as above | Mux uploads + playback |
| `BLOB_READ_WRITE_TOKEN` | Already set | Audio file uploads (existing) |

## Notes

- Mux processes videos asynchronously. After upload, the admin sees "Processing…" with a refresh button. Videos typically process in 30 seconds to 5 minutes depending on file size.
- Audio files use the existing Vercel Blob infrastructure — no new storage account needed.
- Deleting a Mux video from admin also deletes the Mux asset to avoid ongoing storage charges.
- The `muxPlaybackId` thumbnail URL pattern is `https://image.mux.com/{playbackId}/thumbnail.jpg` — used in the admin list view.
