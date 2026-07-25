import { invoke } from '@tauri-apps/api/core'
import type { NetworkTweak, NetworkTweakResult, PowerPlan, StartupItem, PeripheralTweak } from '../types/tuning'

// 网络调优
export function getNetworkTweaks(): Promise<NetworkTweak[]> {
  return invoke('get_network_tweaks')
}

export function applyNetworkTweak(tweakId: string, value: string): Promise<NetworkTweakResult> {
  return invoke('apply_network_tweak', { tweakId, value })
}

export function resetNetworkTweaks(): Promise<NetworkTweakResult[]> {
  return invoke('reset_network_tweaks')
}

// 电源管理
export function getPowerPlans(): Promise<PowerPlan[]> {
  return invoke('get_power_plans')
}

export function activatePowerPlan(guid: string): Promise<void> {
  return invoke('activate_power_plan', { guid })
}

export function createDeckPowerPlan(): Promise<PowerPlan> {
  return invoke('create_deck_power_plan')
}

export function deletePowerPlan(guid: string): Promise<void> {
  return invoke('delete_power_plan', { guid })
}

// 启动项管理
export function getStartupItems(): Promise<StartupItem[]> {
  return invoke('get_startup_items')
}

export function toggleStartupItem(id: string, enabled: boolean): Promise<void> {
  return invoke('toggle_startup_item', { id, enabled })
}

export function removeStartupItem(id: string): Promise<void> {
  return invoke('remove_startup_item', { id })
}

export function openStartupItemLocation(id: string): Promise<void> {
  return invoke('open_startup_item_location', { id })
}

// 外设优化
export function getPeripheralTweaks(): Promise<PeripheralTweak[]> {
  return invoke('get_peripheral_tweaks')
}

export function applyPeripheralTweak(tweakId: string, value: string): Promise<void> {
  return invoke('apply_peripheral_tweak', { tweakId, value })
}

export function resetPeripheralTweaks(): Promise<void> {
  return invoke('reset_peripheral_tweaks')
}
