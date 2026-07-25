import { useEffect, useRef } from 'react'
import { listen } from '../lib/tauri'
import type { UnlistenFn } from '../lib/tauri'

export function useTauriEvent<T = unknown>(
  event: string,
  handler: (payload: T) => void,
) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    let unlisten: UnlistenFn | undefined
    const setup = async () => {
      unlisten = await listen<T>(event, (e) => {
        handlerRef.current(e.payload)
      })
    }
    void setup()
    return () => {
      unlisten?.()
    }
  }, [event])
}
