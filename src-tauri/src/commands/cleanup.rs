use crate::models::cleanup::{
    MemoryCleanupResult, MemoryStatus, ShaderCacheEntry, ShaderCleanResult, StorageCleanResult,
    StorageScanResult,
};
use crate::services::cleanup;

/// 获取当前内存状态
#[tauri::command]
pub fn get_memory_status() -> MemoryStatus {
    let mut sys = sysinfo::System::new_all();
    sys.refresh_memory();
    let total = sys.total_memory();
    let used = sys.used_memory();
    MemoryStatus {
        used_bytes: used,
        total_bytes: total,
        usage_percent: if total > 0 {
            (used as f64 / total as f64) * 100.0
        } else {
            0.0
        },
        available_bytes: sys.available_memory(),
    }
}

/// 执行一键内存清理
#[tauri::command]
pub fn cleanup_memory() -> Result<MemoryCleanupResult, String> {
    cleanup::memory::cleanup_memory()
}

/// 扫描磁盘垃圾文件
#[tauri::command]
pub async fn scan_storage() -> Result<StorageScanResult, String> {
    cleanup::storage::scan_storage()
}

/// 清理选中的类别
#[tauri::command]
pub async fn clean_storage(category_ids: Vec<String>) -> Result<StorageCleanResult, String> {
    cleanup::storage::clean_storage(category_ids)
}

/// 获取着色器缓存列表
#[tauri::command]
pub fn get_shader_caches() -> Vec<ShaderCacheEntry> {
    cleanup::shader::get_shader_caches()
}

/// 清理着色器缓存
#[tauri::command]
pub async fn clean_shader_cache(
    vendor_filter: Option<Vec<String>>,
) -> Result<ShaderCleanResult, String> {
    cleanup::shader::clean_shader_cache(vendor_filter)
}
