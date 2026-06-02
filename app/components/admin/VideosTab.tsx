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
          setVideoItems={setVideoItems}
          {...common}
        />
      )}
    </div>
  )
}
