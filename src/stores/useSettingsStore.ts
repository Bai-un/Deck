import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  language: 'zh-CN' | 'en'
  theme: 'dark'
  accentColor: string
  autoStart: boolean
  minimizeToTray: boolean
  setLanguage: (lang: 'zh-CN' | 'en') => void
  setAccentColor: (color: string) => void
  setAutoStart: (value: boolean) => void
  setMinimizeToTray: (value: boolean) => void
}

const ACCENT_COLORS = [
  '#6C63FF', // 默认蓝紫
  '#FF6B6B', // 珊瑚红
  '#4ECDC4', // 青绿
  '#FFD93D', // 金黄
  '#6BCB77', // 翠绿
  '#FF8C42', // 橙
  '#A66CFF', // 紫
  '#FF6B9D', // 粉
]

export { ACCENT_COLORS }

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'zh-CN',
      theme: 'dark',
      accentColor: ACCENT_COLORS[0],
      autoStart: false,
      minimizeToTray: true,
      setLanguage: (lang) => set({ language: lang }),
      setAccentColor: (color) => set({ accentColor: color }),
      setAutoStart: (value) => set({ autoStart: value }),
      setMinimizeToTray: (value) => set({ minimizeToTray: value }),
    }),
    {
      name: 'deck-settings-store',
    },
  ),
)
