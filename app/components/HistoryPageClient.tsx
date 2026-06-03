'use client'

import { useState, useEffect } from 'react'

interface HistoryItem {
  id: string
  title: string
  fileUrl: string
  fileType: string
  createdAt: Date | string
  categories: { id: string; name: string }[]
}

interface Props {
  items: HistoryItem[]
  categories: { id: string; name: string }[]
}

function PdfThumbnail({ url }: { url: string }) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-white">
      {/* Render PDF at 4× then scale down — no extra packages needed */}
      <iframe
        src={`${url}#toolbar=0&navpanes=0&scrollbar=0&page=1&view=FitH`}
        title="PDF preview"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '400%',
          height: '400%',
          transform: 'scale(0.25)',
          transformOrigin: 'top left',
          pointerEvents: 'none',
          border: 'none',
        }}
      />
      {/* PDF badge overlay */}
      <div className="absolute bottom-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
        PDF
      </div>
    </div>
  )
}

export default function HistoryPageClient({ items, categories }: Props) {
  const [activeItem, setActiveItem] = useState<HistoryItem | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const countFor = (id: string) => items.filter((it) => it.categories.some((c) => c.id === id)).length

  // Server already sorted `categories` by admin order; keep only those with ≥1 item.
  const visibleCategories = categories.filter((c) => countFor(c.id) > 0)

  // Guard: if the active category disappeared after a revalidation, fall back to All.
  const activeExists = activeCategory === 'all' || visibleCategories.some((c) => c.id === activeCategory)
  const effectiveActive = activeExists ? activeCategory : 'all'

  const visible = effectiveActive === 'all'
    ? items
    : items.filter((it) => it.categories.some((c) => c.id === effectiveActive))

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveItem(null)
    }
    if (activeItem) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [activeItem])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-[#0f172a] py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Our History</h1>
        <div className="w-20 h-1 bg-[#d4a853] mx-auto mb-6 rounded-full" />
        <p className="text-gray-400 max-w-xl mx-auto text-lg">
          A look back at the legacy and milestones of the Lubavitch Youth Organization.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {visibleCategories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {[{ id: 'all', name: 'All', count: items.length }, ...visibleCategories.map((c) => ({ ...c, count: countFor(c.id) }))].map((c) => (
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

        {items.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No history items yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {visible.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveItem(item)}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left w-full"
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                  {item.fileType === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.fileUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <PdfThumbnail url={item.fileUrl} />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="bg-[#d4a853] text-[#0f172a] text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {item.fileType === 'pdf' ? 'View PDF' : 'View'}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 text-base leading-snug group-hover:text-[#1e3a5f] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1.5">
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeItem && (
        <div
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setActiveItem(null) }}
        >
          <div className="bg-white rounded-2xl overflow-hidden w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="min-w-0 pr-4">
                <h2 className="text-lg font-semibold text-gray-900 leading-tight">{activeItem.title}</h2>
                {activeItem.fileType === 'pdf' && (
                  <a
                    href={activeItem.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#1e3a5f] hover:text-[#d4a853] transition-colors inline-flex items-center gap-1 mt-1"
                  >
                    Open in new tab
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors shrink-0"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden min-h-0">
              {activeItem.fileType === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeItem.fileUrl}
                  alt={activeItem.title}
                  className="w-full h-full object-contain"
                  style={{ maxHeight: '72vh' }}
                />
              ) : (
                <iframe
                  src={activeItem.fileUrl}
                  title={activeItem.title}
                  className="w-full"
                  style={{ height: '72vh', border: 'none' }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
