import { useEffect, useState } from 'react'
import { useHardwareStore } from '../stores/useHardwareStore'
import type { SystemInfo } from '../types/hardware'

export function useHardwareInfo(): {
  systemInfo: SystemInfo | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
} {
  const systemInfo = useHardwareStore((s) => s.systemInfo)
  const fetchSystemInfo = useHardwareStore((s) => s.fetchSystemInfo)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      await fetchSystemInfo()
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!systemInfo) {
      refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { systemInfo, loading, error, refresh }
}
