import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import type { SystemInfo, SensorSnapshot } from '../types/hardware'

export async function getHardwareInfo(): Promise<SystemInfo> {
  return invoke('get_hardware_info')
}

export async function getSensorSnapshot(): Promise<SensorSnapshot> {
  return invoke('get_sensor_snapshot')
}

export async function startMonitor(intervalMs?: number): Promise<void> {
  return invoke('start_hardware_monitor', { intervalMs })
}

export async function stopMonitor(): Promise<void> {
  return invoke('stop_hardware_monitor')
}

export async function setMonitorInterval(intervalMs: number): Promise<void> {
  return invoke('set_monitor_interval', { intervalMs })
}

export function onSensorUpdate(callback: (snapshot: SensorSnapshot) => void) {
  return listen<SensorSnapshot>('hardware:sensor-update', (event) => {
    callback(event.payload)
  })
}
