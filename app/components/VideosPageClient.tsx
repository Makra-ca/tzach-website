'use client'

import { useState } from 'react'
import MuxPlayer from '@mux/mux-player-react'

interface VideoItem {
  id: string
  title: string
  description: string | null
  mediaType: string
  embedUrl: string | null
  videoUrl: string | null
  muxPlaybackId: string | null
  categories: { id: string; name: string }[]
}

interface Props {
  videos: VideoItem[]
  categories: { id: string; name: string }[]
}

function MediaRenderer({ video }: { video: VideoItem }) {
  // Audio — branded 16:9 "cover art" panel so it fills the same frame as videos
  if (video.mediaType === 'audio') {
    return (
      <div className="aspect-video w-full bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] flex flex-col items-center justify-center gap-5 px-6">
        <div className="w-16 h-16 rounded-full bg-[#d4a853]/15 flex items-center justify-center">
          <svg className="w-8 h-8 text-[#d4a853]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
        <audio
          controls
          src={video.videoUrl ?? undefined}
          className="w-full max-w-xs"
        />
      </div>
    )
  }

  // Mux video — contained in a uniform 16:9 navy frame; portrait clips letterbox cleanly
  if (video.mediaType === 'mux') {
    if (!video.muxPlaybackId) {
      return (
        <div className="aspect-video w-full bg-[#0f172a] flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2" />
            <p className="text-white/50 text-sm">Processing video…</p>
          </div>
        </div>
      )
    }
    return (
      <div className="aspect-video w-full bg-[#0f172a]">
        <MuxPlayer
          playbackId={video.muxPlaybackId}
          style={{ width: '100%', height: '100%', '--media-object-fit': 'contain' }}
          accentColor="#d4a853"
        />
      </div>
    )
  }

  // URL embed (YouTube/Vimeo) — already 16:9
  return (
    <div className="aspect-video w-full bg-[#0f172a]">
      <iframe
        src={video.embedUrl ?? undefined}
        title={video.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  )
}

export default function VideosPageClient({ videos, categories }: Props) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-[#0f172a] py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Videos</h1>
        <div className="w-20 h-1 bg-[#d4a853] mx-auto mb-6 rounded-full" />
        <p className="text-gray-400 max-w-xl mx-auto text-lg">
          Watch videos from LYO programs, events, and campaigns.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
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

        {videos.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No videos yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {visible.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <MediaRenderer video={video} />
                <div className="p-5 border-t border-gray-100">
                  <h3 className="font-semibold text-gray-900 text-lg leading-snug">{video.title}</h3>
                  {video.description && (
                    <p className="text-gray-600 text-sm mt-2 leading-relaxed">{video.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
