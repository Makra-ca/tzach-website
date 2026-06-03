import type { Dispatch, SetStateAction } from 'react'
import type { Video, Category, HistoryItem, HistoryCategory } from '@prisma/client'

export type VideoWithCategories = Video & { categories: Category[] }
export type HistoryItemWithCategories = HistoryItem & { categories: HistoryCategory[] }

export interface ConfirmState {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => Promise<void>
}

export interface CommonTabProps {
  showToast: (message: string, type: 'success' | 'error') => void
  setConfirmModal: Dispatch<SetStateAction<ConfirmState>>
  setConfirmLoading: Dispatch<SetStateAction<boolean>>
  closeConfirmModal: () => void
}
