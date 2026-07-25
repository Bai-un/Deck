use serde::{Deserialize, Serialize};

/// 内存清理结果
#[derive(Serialize, Deserialize, Clone)]
pub struct MemoryCleanupResult {
    pub freed_bytes: u64,
    pub before_used_bytes: u64,
    pub after_used_bytes: u64,
    pub total_bytes: u64,
}

/// 内存状态（查询时返回）
#[derive(Serialize, Deserialize, Clone)]
pub struct MemoryStatus {
    pub used_bytes: u64,
    pub total_bytes: u64,
    pub usage_percent: f64,
    pub available_bytes: u64,
}

/// 存储扫描类别
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ScanCategory {
    pub id: String,
    pub name: String,
    pub description: String,
    pub size_bytes: u64,
    pub file_count: u64,
    pub paths: Vec<String>,
    pub safe_to_clean: bool,
}

/// 存储扫描结果
#[derive(Serialize, Deserialize, Clone)]
pub struct StorageScanResult {
    pub categories: Vec<ScanCategory>,
    pub total_size_bytes: u64,
    pub scan_duration_ms: u64,
}

/// 存储清理结果
#[derive(Serialize, Deserialize, Clone)]
pub struct StorageCleanResult {
    pub freed_bytes: u64,
    pub freed_file_count: u64,
    pub failed_items: Vec<String>,
}

/// 着色器缓存条目
#[derive(Serialize, Deserialize, Clone)]
pub struct ShaderCacheEntry {
    pub gpu_vendor: String,
    pub cache_path: String,
    pub size_bytes: u64,
    pub description: String,
}

/// 着色器清理结果
#[derive(Serialize, Deserialize, Clone)]
pub struct ShaderCleanResult {
    pub freed_bytes: u64,
    pub cleaned_entries: Vec<String>,
    pub failed_entries: Vec<String>,
}
