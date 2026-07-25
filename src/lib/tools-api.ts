import { invoke } from '@tauri-apps/api/core'
import type { DiskHealth, GpuRenameInfo, NvidiaDriverInfo, BuiltinTool } from '../types/tools'

export const getDiskHealth = () => invoke<DiskHealth[]>('get_disk_health')

export const getGpuRenameInfo = () => invoke<GpuRenameInfo[]>('get_gpu_rename_info')

export const renameGpu = (gpuIndex: number, newName: string) =>
  invoke<void>('rename_gpu', { gpuIndex, newName })

export const restoreGpuName = (gpuIndex: number) =>
  invoke<void>('restore_gpu_name', { gpuIndex })

export const getNvidiaDriverInfo = () => invoke<NvidiaDriverInfo>('get_nvidia_driver_info')

export const checkNvidiaDriverUpdate = () => invoke<string | null>('check_nvidia_driver_update')

export const getBuiltinTools = () => invoke<BuiltinTool[]>('get_builtin_tools')

export const launchBuiltinTool = (command: string) =>
  invoke<void>('launch_builtin_tool', { command })
