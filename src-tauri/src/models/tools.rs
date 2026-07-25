use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiskHealth {
    pub name: String,
    pub model: String,
    pub serial: String,
    pub firmware: String,
    pub interface: String,
    pub capacity_bytes: u64,
    pub temperature_c: Option<u32>,
    pub power_on_hours: Option<u64>,
    pub health_status: String,
    pub health_percent: u8,
    pub smart_attributes: Vec<SmartAttribute>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SmartAttribute {
    pub id: u8,
    pub name: String,
    pub value: u32,
    pub worst: u32,
    pub threshold: u32,
    pub raw_value: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GpuRenameInfo {
    pub gpu_index: u32,
    pub original_name: String,
    pub current_name: String,
    pub is_renamed: bool,
    pub registry_path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NvidiaDriverInfo {
    pub installed_version: String,
    pub driver_date: String,
    pub gpu_name: String,
    pub cuda_version: String,
    pub latest_version: Option<String>,
    pub update_available: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BuiltinTool {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub command: String,
    pub icon: String,
    pub requires_admin: bool,
}
