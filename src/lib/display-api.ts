import { invoke } from '@tauri-apps/api/core'
import type { ColorFilter, FilterState, DLSSPreset, DisplayInfo, ResolutionPreset, OverlayConfig } from '../types/display'

// Filter
export function getFilterPresets(): Promise<ColorFilter[]> {
  return invoke('get_filter_presets')
}

export function getFilterState(): Promise<FilterState> {
  return invoke('get_filter_state')
}

export function applyColorFilter(filterId: string, intensity: number): Promise<void> {
  return invoke('apply_color_filter', { filterId, intensity })
}

export function removeColorFilter(): Promise<void> {
  return invoke('remove_color_filter')
}

// DLSS
export function getDlssPresets(): Promise<DLSSPreset[]> {
  return invoke('get_dlss_presets')
}

export function setDlssPreset(presetId: string): Promise<void> {
  return invoke('set_dlss_preset', { presetId })
}

export function isNvidiaAvailable(): Promise<boolean> {
  return invoke('is_nvidia_available')
}

// Resolution
export function getDisplayInfo(): Promise<DisplayInfo> {
  return invoke('get_display_info')
}

export function getAvailableResolutions(): Promise<ResolutionPreset[]> {
  return invoke('get_available_resolutions')
}

export function setResolution(width: number, height: number, refreshRate: number): Promise<void> {
  return invoke('set_resolution', { width, height, refreshRate })
}

export function calculateCustomResolution(nativeWidth: number, nativeHeight: number, targetRatio: string, scalePercent: number): Promise<[number, number]> {
  return invoke('calculate_custom_resolution', { nativeWidth, nativeHeight, targetRatio, scalePercent })
}

export function resetToNativeResolution(): Promise<void> {
  return invoke('reset_to_native_resolution')
}

// Overlay
export function getOverlayConfig(): Promise<OverlayConfig> {
  return invoke('get_overlay_config')
}

export function saveOverlayConfig(config: OverlayConfig): Promise<void> {
  return invoke('save_overlay_config', { config })
}

export function toggleOverlay(enabled: boolean): Promise<void> {
  return invoke('toggle_overlay', { enabled })
}
