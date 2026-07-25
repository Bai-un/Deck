export interface ColorFilter {
  id: string
  name: string
  description: string
  r_multiplier: number
  g_multiplier: number
  b_multiplier: number
  opacity: number
  color_temperature: number
}

export interface FilterState {
  active: boolean
  current_filter_id: string | null
  intensity: number
}

export interface DLSSPreset {
  id: string
  name: string
  description: string
  render_scale: number
  is_active: boolean
}

export interface ResolutionPreset {
  id: string
  name: string
  width: number
  height: number
  refresh_rate: number
  aspect_ratio: string
  is_current: boolean
  is_native: boolean
}

export interface DisplayInfo {
  name: string
  native_width: number
  native_height: number
  current_width: number
  current_height: number
  current_refresh_rate: number
  available_rates: number[]
  scale_factor: number
}

export interface OverlayConfig {
  enabled: boolean
  show_cpu: boolean
  show_gpu: boolean
  show_memory: boolean
  show_disk: boolean
  show_fps: boolean
  show_time: boolean
  position: string
  opacity: number
  font_size: number
  background_blur: boolean
  refresh_rate_ms: number
}
