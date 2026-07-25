// This file mirrors Rust models/hardware.rs types for the frontend.

export interface SystemInfo {
  os_name: string;
  os_version: string;
  hostname: string;
  cpu: CpuInfo;
  gpus: GpuInfo[];
  total_memory_bytes: number;
  disks: DiskInfo[];
}

export interface CpuInfo {
  brand: string;
  vendor: string;
  core_count: number;
  thread_count: number;
  base_frequency_mhz: number;
}

export interface GpuInfo {
  name: string;
  vendor: string;
  vram_total_mb: number;
  driver_version: string;
  is_nvidia: boolean;
}

export interface DiskInfo {
  name: string;
  mount_point: string;
  filesystem: string;
  total_bytes: number;
  is_removable: boolean;
  disk_type: string;
}

export interface SensorSnapshot {
  timestamp: number;
  cpu: CpuSensorData;
  gpus: GpuSensorData[];
  memory: MemorySensorData;
  disks: DiskSensorData[];
}

export interface CpuSensorData {
  usage_percent: number;
  temperature_c: number | null;
  frequency_mhz: number;
  per_core_usage: number[];
  power_watts: number | null;
}

export interface GpuSensorData {
  name: string;
  usage_percent: number;
  temperature_c: number | null;
  vram_used_mb: number;
  vram_total_mb: number;
  fan_speed_percent: number | null;
  power_watts: number | null;
  clock_core_mhz: number | null;
  clock_memory_mhz: number | null;
}

export interface MemorySensorData {
  used_bytes: number;
  total_bytes: number;
  usage_percent: number;
  available_bytes: number;
  swap_used_bytes: number;
  swap_total_bytes: number;
}

export interface DiskSensorData {
  name: string;
  used_bytes: number;
  total_bytes: number;
  usage_percent: number;
  read_bytes_per_sec: number;
  write_bytes_per_sec: number;
  temperature_c: number | null;
}
