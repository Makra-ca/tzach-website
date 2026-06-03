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
          <button
            key={key}
            onClick={() => setSub(key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              sub === key ? 'bg-[#1e3a5f] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {key === 'items' ? `Items (${historyItems.length})` : `Categories (${categories.length})`}
          </button>
        ))}
      </div>

      {sub === 'items' ? (
        <HistoryItemsManager historyItems={historyItems} setHistoryItems={setHistoryItems} categories={categories} {...common} />
      ) : (
        <HistoryCategoriesManager
          categories={categories}
          setCategories={setCategories}
          historyItems={historyItems}
          setHistoryItems={setHistoryItems}
          {...common}
        />
      )}
    </div>
  )
}
