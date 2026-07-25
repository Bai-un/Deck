export interface DiskHealth {
  name: string
  model: string
  serial: string
  firmware: string
  interface: string
  capacity_bytes: number
  temperature_c: number | null
  power_on_hours: number | null
  health_status: string
  health_percent: number
  smart_attributes: SmartAttribute[]
}

export interface SmartAttribute {
  id: number
  name: string
  value: number
  worst: number
  threshold: number
  raw_value: string
  status: string
}

export interface GpuRenameInfo {
  gpu_index: number
  original_name: string
  current_name: string
  is_renamed: boolean
  registry_path: string
}

export interface NvidiaDriverInfo {
  installed_version: string
  driver_date: string
  gpu_name: string
  cuda_version: string
  latest_version: string | null
  update_available: boolean
}

export interface BuiltinTool {
  id: string
  name: string
  description: string
  category: string
  command: string
  icon: string
  requires_admin: boolean
}
