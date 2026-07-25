import { create } from 'zustand'
import type { FilterState, OverlayConfig } from '../types/display'
import * as api from '../lib/display-api'

interface DisplayState {
  filterState: FilterState | null
  overlayConfig: OverlayConfig | null
  loading: boolean
  fetchFilterState: () => Promise<void>
  fetchOverlayConfig: () => Promise<void>
}

export const useDisplayStore = create<DisplayState>((set) => ({
  filterState: null,
  overlayConfig: null,
  loading: false,

  fetchFilterState: async () => {
    try {
      const state = await api.getFilterState()
      set({ filterState: state })
    } catch {
      // ignore — will be available at runtime
    }
  },

  fetchOverlayConfig: async () => {
    try {
      const config = await api.getOverlayConfig()
      set({ overlayConfig: config })
    } catch {
      // ignore
    }
  },
}))
