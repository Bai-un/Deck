import { create } from 'zustand'
import type {
  MemoryStatus,
  MemoryCleanupResult,
  StorageScanResult,
  StorageCleanResult,
  ShaderCacheEntry,
  ShaderCleanResult,
} from '../types/cleanup'
import * as api from '../lib/cleanup-api'

interface CleanupState {
  // Memory
  memoryStatus: MemoryStatus | null
  lastMemoryCleanup: MemoryCleanupResult | null
  cleaningMemory: boolean

  // Storage
  scanResult: StorageScanResult | null
  scanning: boolean
  selectedCategoryIds: string[]
  cleaningStorage: boolean
  storageCleanResult: StorageCleanResult | null

  // Shader
  shaderCaches: ShaderCacheEntry[]
  selectedVendorIds: string[]
  cleaningShader: boolean
  shaderCleanResult: ShaderCleanResult | null

  // Actions
  fetchMemoryStatus: () => Promise<void>
  cleanupMemory: () => Promise<void>
  scanStorage: () => Promise<void>
  toggleCategory: (id: string) => void
  selectAllCategories: () => void
  cleanStorage: () => Promise<void>
  fetchShaderCaches: () => Promise<void>
  toggleVendor: (vendor: string) => void
  selectAllVendors: () => void
  cleanShaderCache: () => Promise<void>
}

export const useCleanupStore = create<CleanupState>((set, get) => ({
  // Initial state
  memoryStatus: null,
  lastMemoryCleanup: null,
  cleaningMemory: false,

  scanResult: null,
  scanning: false,
  selectedCategoryIds: [],
  cleaningStorage: false,
  storageCleanResult: null,

  shaderCaches: [],
  selectedVendorIds: [],
  cleaningShader: false,
  shaderCleanResult: null,

  fetchMemoryStatus: async () => {
    try {
      const status = await api.getMemoryStatus()
      set({ memoryStatus: status })
    } catch (err) {
      console.error('Failed to fetch memory status:', err)
    }
  },

  cleanupMemory: async () => {
    set({ cleaningMemory: true })
    try {
      const result = await api.cleanupMemory()
      set({ lastMemoryCleanup: result, cleaningMemory: false })
      // Re-fetch status
      const status = await api.getMemoryStatus()
      set({ memoryStatus: status })
    } catch (err) {
      console.error('Failed to cleanup memory:', err)
      set({ cleaningMemory: false })
    }
  },

  scanStorage: async () => {
    set({ scanning: true, scanResult: null })
    try {
      const result = await api.scanStorage()
      set({
        scanResult: result,
        scanning: false,
        selectedCategoryIds: result.categories
          .filter((c) => c.safe_to_clean)
          .map((c) => c.id),
        storageCleanResult: null,
      })
    } catch (err) {
      console.error('Failed to scan storage:', err)
      set({ scanning: false })
    }
  },

  toggleCategory: (id) => {
    set((s) => ({
      selectedCategoryIds: s.selectedCategoryIds.includes(id)
        ? s.selectedCategoryIds.filter((i) => i !== id)
        : [...s.selectedCategoryIds, id],
    }))
  },

  selectAllCategories: () => {
    set((s) => ({
      selectedCategoryIds: s.scanResult?.categories.map((c) => c.id) ?? [],
    }))
  },

  cleanStorage: async () => {
    const { selectedCategoryIds } = get()
    if (selectedCategoryIds.length === 0) return
    set({ cleaningStorage: true })
    try {
      const result = await api.cleanStorage(selectedCategoryIds)
      set({ storageCleanResult: result, cleaningStorage: false })
      // Re-scan
      const scan = await api.scanStorage()
      set({ scanResult: scan })
    } catch (err) {
      console.error('Failed to clean storage:', err)
      set({ cleaningStorage: false })
    }
  },

  fetchShaderCaches: async () => {
    try {
      const caches = await api.getShaderCaches()
      set({
        shaderCaches: caches,
        selectedVendorIds: caches.map((c) => c.gpu_vendor),
        shaderCleanResult: null,
      })
    } catch (err) {
      console.error('Failed to fetch shader caches:', err)
    }
  },

  toggleVendor: (vendor) => {
    set((s) => ({
      selectedVendorIds: s.selectedVendorIds.includes(vendor)
        ? s.selectedVendorIds.filter((v) => v !== vendor)
        : [...s.selectedVendorIds, vendor],
    }))
  },

  selectAllVendors: () => {
    set((s) => ({
      selectedVendorIds: s.shaderCaches.map((c) => c.gpu_vendor),
    }))
  },

  cleanShaderCache: async () => {
    const { selectedVendorIds } = get()
    if (selectedVendorIds.length === 0) return
    set({ cleaningShader: true })
    try {
      const result = await api.cleanShaderCache(selectedVendorIds)
      set({ shaderCleanResult: result, cleaningShader: false })
      // Re-fetch
      const caches = await api.getShaderCaches()
      set({ shaderCaches: caches })
    } catch (err) {
      console.error('Failed to clean shader cache:', err)
      set({ cleaningShader: false })
    }
  },
}))
