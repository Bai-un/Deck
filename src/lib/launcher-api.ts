import { invoke } from '@tauri-apps/api/core'
import type { LauncherItem } from '../types/launcher'

export async function getLauncherItems(): Promise<LauncherItem[]> {
  return invoke('get_launcher_items')
}

export async function addLauncherItem(
  exePath: string,
  customName?: string,
): Promise<LauncherItem> {
  return invoke('add_launcher_item', { exePath, customName })
}

export async function removeLauncherItem(id: string): Promise<void> {
  return invoke('remove_launcher_item', { id })
}

export async function reorderLauncherItems(itemIds: string[]): Promise<void> {
  return invoke('reorder_launcher_items', { itemIds })
}

export async function launchApp(exePath: string): Promise<void> {
  return invoke('launch_app', { exePath })
}

export async function renameLauncherItem(id: string, newName: string): Promise<void> {
  return invoke('rename_launcher_item', { id, newName })
}

export async function openFileLocation(exePath: string): Promise<void> {
  return invoke('open_file_location', { exePath })
}
