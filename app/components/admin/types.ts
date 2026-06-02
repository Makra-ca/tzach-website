import type { Dispatch, SetStateAction } from 'react'
import type { Video, Category } from '@prisma/client'

export type VideoWithCategories = Video & { categories: Category[] }

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
