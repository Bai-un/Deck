export interface MemoryCleanupResult {
  freed_bytes: number
  before_used_bytes: number
  after_used_bytes: number
  total_bytes: number
}

export interface MemoryStatus {
  used_bytes: number
  total_bytes: number
  usage_percent: number
  available_bytes: number
}

export interface ScanCategory {
  id: string
  name: string
  description: string
  size_bytes: number
  file_count: number
  paths: string[]
  safe_to_clean: boolean
}

export interface StorageScanResult {
  categories: ScanCategory[]
  total_size_bytes: number
  scan_duration_ms: number
}

export interface StorageCleanResult {
  freed_bytes: number
  freed_file_count: number
  failed_items: string[]
}

export interface ShaderCacheEntry {
  gpu_vendor: string
  cache_path: string
  size_bytes: number
  description: string
}

export interface ShaderCleanResult {
  freed_bytes: number
  cleaned_entries: string[]
  failed_entries: string[]
}
