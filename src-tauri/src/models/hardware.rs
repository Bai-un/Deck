use serde::{Deserialize, Serialize};

/// 系统静态信息（一次性获取）
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SystemInfo {
    pub os_name: String,
    pub os_version: String,
    pub hostname: String,
    pub cpu: CpuInfo,
    pub gpus: Vec<GpuInfo>,
    pub total_memory_bytes: u64,
    pub disks: Vec<DiskInfo>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CpuInfo {
    pub brand: String,
    pub vendor: String,
    pub core_count: usize,
    pub thread_count: usize,
    pub base_frequency_mhz: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GpuInfo {
    pub name: String,
    pub vendor: String,
    pub vram_total_mb: u64,
    pub driver_version: String,
    pub is_nvidia: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DiskInfo {
    pub name: String,
    pub mount_point: String,
    pub filesystem: String,
    pub total_bytes: u64,
    pub is_removable: bool,
    pub disk_type: String,
}

/// 实时传感器快照（周期性推送）
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SensorSnapshot {
    pub timestamp: u64,
    pub cpu: CpuSensorData,
    pub gpus: Vec<GpuSensorData>,
    pub memory: MemorySensorData,
    pub disks: Vec<DiskSensorData>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CpuSensorData {
    pub usage_percent: f32,
    pub temperature_c: Option<f32>,
    pub frequency_mhz: f64,
    pub per_core_usage: Vec<f32>,
    pub power_watts: Option<f32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GpuSensorData {
    pub name: String,
    pub usage_percent: f32,
    pub temperature_c: Option<f32>,
    pub vram_used_mb: u64,
    pub vram_total_mb: u64,
    pub fan_speed_percent: Option<f32>,
    pub power_watts: Option<f32>,
    pub clock_core_mhz: Option<u32>,
    pub clock_memory_mhz: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MemorySensorData {
    pub used_bytes: u64,
    pub total_bytes: u64,
    pub usage_percent: f32,
    pub available_bytes: u64,
    pub swap_used_bytes: u64,
    pub swap_total_bytes: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DiskSensorData {
    pub name: String,
    pub used_bytes: u64,
    pub total_bytes: u64,
    pub usage_percent: f32,
    pub read_bytes_per_sec: u64,
    pub write_bytes_per_sec: u64,
    pub temperature_c: Option<f32>,
}
