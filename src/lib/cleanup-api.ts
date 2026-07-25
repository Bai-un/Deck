import { invoke } from '@tauri-apps/api/core'
import type {
  MemoryStatus,
  MemoryCleanupResult,
  StorageScanResult,
  StorageCleanResult,
  ShaderCacheEntry,
  ShaderCleanResult,
} from '../types/cleanup'

export async function getMemoryStatus(): Promise<MemoryStatus> {
  return invoke('get_memory_status')
}

export async function cleanupMemory(): Promise<MemoryCleanupResult> {
  return invoke('cleanup_memory')
}

export async function scanStorage(): Promise<StorageScanResult> {
  return invoke('scan_storage')
}

export async function cleanStorage(categoryIds: string[]): Promise<StorageCleanResult> {
  return invoke('clean_storage', { categoryIds })
}

export async function getShaderCaches(): Promise<ShaderCacheEntry[]> {
  return invoke('get_shader_caches')
}

export async function cleanShaderCache(
  vendorFilter?: string[],
): Promise<ShaderCleanResult> {
  return invoke('clean_shader_cache', { vendorFilter: vendorFilter ?? null })
}
