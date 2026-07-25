export interface SystemInfo {
  os_version: string
  cpu_model: string
  gpu_model: string
  total_memory: string
  disks: string[]
}

export interface NavItem {
  label: string
  path: string
  icon: string
}
