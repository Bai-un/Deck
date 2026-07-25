import { useEffect, useRef } from 'react'
import { useHardwareStore, subscribeToSensorUpdates } from '../stores/useHardwareStore'

export function useSensorData(intervalMs?: number) {
  const store = useHardwareStore()
  const unsubRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const start = async () => {
      await store.startMonitor(intervalMs)
      unsubRef.current = subscribeToSensorUpdates()
    }
    start()

    return () => {
      if (unsubRef.current) {
        unsubRef.current()
        unsubRef.current = null
      }
      store.stopMonitor()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs])

  return {
    snapshot: store.currentSnapshot,
    monitorRunning: store.monitorRunning,
    start: store.startMonitor,
    stop: store.stopMonitor,
  }
}
