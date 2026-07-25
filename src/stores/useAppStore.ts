import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  sidebarCollapsed: boolean
  currentPath: string
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setCurrentPath: (path: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      currentPath: '/',
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setCurrentPath: (path) => set({ currentPath: path }),
    }),
    {
      name: 'deck-app-store',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
)
