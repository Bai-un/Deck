import { create } from 'zustand'
import type { LauncherItem } from '../types/launcher'
import * as api from '../lib/launcher-api'

interface LauncherState {
  items: LauncherItem[]
  loading: boolean

  fetchItems: () => Promise<void>
  addItem: (exePath: string, customName?: string) => Promise<void>
  removeItem: (id: string) => Promise<void>
  reorderItems: (itemIds: string[]) => Promise<void>
  launchItem: (exePath: string) => Promise<void>
  renameItem: (id: string, newName: string) => Promise<void>
}

export const useLauncherStore = create<LauncherState>((set) => ({
  items: [],
  loading: false,

  fetchItems: async () => {
    set({ loading: true })
    try {
      const items = await api.getLauncherItems()
      set({ items, loading: false })
    } catch (err) {
      console.error('Failed to fetch launcher items:', err)
      set({ loading: false })
    }
  },

  addItem: async (exePath, customName) => {
    try {
      const item = await api.addLauncherItem(exePath, customName)
      set((s) => ({ items: [...s.items, item] }))
    } catch (err) {
      console.error('Failed to add launcher item:', err)
      throw err
    }
  },

  removeItem: async (id) => {
    try {
      await api.removeLauncherItem(id)
      set((s) => ({ items: s.items.filter((i) => i.id !== id) }))
    } catch (err) {
      console.error('Failed to remove launcher item:', err)
      throw err
    }
  },

  reorderItems: async (itemIds) => {
    try {
      await api.reorderLauncherItems(itemIds)
      set((s) => {
        const map = new Map(s.items.map((i) => [i.id, i]))
        return {
          items: itemIds.map((id, idx) => ({ ...map.get(id)!, sort_order: idx })),
        }
      })
    } catch (err) {
      console.error('Failed to reorder launcher items:', err)
    }
  },

  launchItem: async (exePath) => {
    try {
      await api.launchApp(exePath)
    } catch (err) {
      console.error('Failed to launch app:', err)
      throw err
    }
  },

  renameItem: async (id, newName) => {
    try {
      await api.renameLauncherItem(id, newName)
      set((s) => ({
        items: s.items.map((i) => (i.id === id ? { ...i, name: newName } : i)),
      }))
    } catch (err) {
      console.error('Failed to rename launcher item:', err)
      throw err
    }
  },
}))
