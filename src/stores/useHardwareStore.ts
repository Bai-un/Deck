import { create } from 'zustand'
import { getHardwareInfo, startMonitor, stopMonitor } from '../lib/hardware-api'
import { onSensorUpdate } from '../lib/hardware-api'
import type { UnlistenFn } from '../lib/tauri'
import type { SystemInfo, SensorSnapshot } from '../types/hardware'

interface HardwareState {
  systemInfo: SystemInfo | null
  currentSnapshot: SensorSnapshot | null
  cpuHistory: number[]
  gpuHistory: number[]
  memoryHistory: number[]
  monitorRunning: boolean
  interval: number

  fetchSystemInfo: () => Promise<void>
  startMonitor: (intervalMs?: number) => Promise<void>
  stopMonitor: () => Promise<void>
  pushSnapshot: (snapshot: SensorSnapshot) => void
}

const MAX_HISTORY = 60

export const useHardwareStore = create<HardwareState>()((set, get) => ({
  systemInfo: null,
  currentSnapshot: null,
  cpuHistory: [],
  gpuHistory: [],
  memoryHistory: [],
  monitorRunning: false,
  interval: 1000,

  fetchSystemInfo: async () => {
    try {
      const info = await getHardwareInfo()
      set({ systemInfo: info })
    } catch (e) {
      console.error('Failed to fetch system info:', e)
    }
  },

  startMonitor: async (intervalMs?: number) => {
    if (get().monitorRunning) return
    const interval = intervalMs ?? 1000
    try {
      await startMonitor(interval)
      set({ interval, monitorRunning: true })
    } catch (e) {
      console.error('Failed to start monitor:', e)
    }
  },

  stopMonitor: async () => {
    if (!get().monitorRunning) return
    try {
      await stopMonitor()
      set({ monitorRunning: false })
    } catch (e) {
      console.error('Failed to stop monitor:', e)
    }
  },

  pushSnapshot: (snapshot: SensorSnapshot) => {
    const { cpuHistory, gpuHistory, memoryHistory } = get()
    const cpu = [...cpuHistory, snapshot.cpu.usage_percent]
    const gpu = [...gpuHistory, ...(snapshot.gpus.length > 0 ? [snapshot.gpus[0].usage_percent] : [0])]
    const mem = [...memoryHistory, snapshot.memory.usage_percent]

    if (cpu.length > MAX_HISTORY) cpu.shift()
    if (gpu.length > MAX_HISTORY) gpu.shift()
    if (mem.length > MAX_HISTORY) mem.shift()

    set({
      currentSnapshot: snapshot,
      cpuHistory: cpu,
      gpuHistory: gpu,
      memoryHistory: mem,
    })
  },
}))

// Singleton unlisten reference for auto-cleanup
let unlistenFn: UnlistenFn | null = null

export function subscribeToSensorUpdates(): () => void {
  if (unlistenFn) {
    unlistenFn()
    unlistenFn = null
  }

  onSensorUpdate((snapshot) => {
    useHardwareStore.getState().pushSnapshot(snapshot)
  }).then((fn) => {
    unlistenFn = fn
  })

  return () => {
    if (unlistenFn) {
      unlistenFn()
      unlistenFn = null
    }
  }
}
