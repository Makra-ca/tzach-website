'use client'

interface VideoItem {
  id: string
  title: string
  description: string | null
  embedUrl: string
}

interface Props {
  videos: VideoItem[]
}

export default function VideosPageClient({ videos }: Props) {
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
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                {/* 16:9 iframe embed */}
                <div className="aspect-video w-full bg-black">
                  <iframe
                    src={video.embedUrl}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                    style={{ border: 'none' }}
                  />
                </div>
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
