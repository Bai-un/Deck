use crate::models::cleanup::{ShaderCacheEntry, ShaderCleanResult};
use walkdir::WalkDir;

/// 计算目录大小
fn dir_size(path: &str) -> Result<u64, ()> {
    let p = std::path::Path::new(path);
    if !p.is_dir() {
        return Err(());
    }
    let mut total: u64 = 0;
    for entry in WalkDir::new(path).into_iter().filter_map(|e| e.ok()) {
        if entry.file_type().is_file() {
            total += entry.metadata().map(|m| m.len()).unwrap_or(0);
        }
    }
    Ok(total)
}

/// 展开环境变量
fn expand_env_vars(path: &str) -> String {
    let mut result = path.to_string();
    if let Ok(val) = std::env::var("LOCALAPPDATA") {
        result = result.replace("%LOCALAPPDATA%", &val);
    }
    result
}

/// 获取所有已知的着色器缓存条目
pub fn get_shader_caches() -> Vec<ShaderCacheEntry> {
    let mut entries = Vec::new();

    // NVIDIA DirectX 着色器缓存
    let nvidia_dx = expand_env_vars("%LOCALAPPDATA%\\NVIDIA\\DXCache");
    if let Ok(size) = dir_size(&nvidia_dx) {
        entries.push(ShaderCacheEntry {
            gpu_vendor: "NVIDIA".to_string(),
            cache_path: nvidia_dx.clone(),
            size_bytes: size,
            description: "NVIDIA DirectX 着色器缓存".to_string(),
        });
    }

    // NVIDIA OpenGL 着色器缓存
    let nvidia_gl = expand_env_vars("%LOCALAPPDATA%\\NVIDIA\\GLCache");
    if let Ok(size) = dir_size(&nvidia_gl) {
        entries.push(ShaderCacheEntry {
            gpu_vendor: "NVIDIA".to_string(),
            cache_path: nvidia_gl.clone(),
            size_bytes: size,
            description: "NVIDIA OpenGL 着色器缓存".to_string(),
        });
    }

    // AMD DirectX 着色器缓存
    let amd = expand_env_vars("%LOCALAPPDATA%\\AMD\\DxCache");
    if let Ok(size) = dir_size(&amd) {
        entries.push(ShaderCacheEntry {
            gpu_vendor: "AMD".to_string(),
            cache_path: amd.clone(),
            size_bytes: size,
            description: "AMD DirectX 着色器缓存".to_string(),
        });
    }

    // DirectX 通用着色器缓存
    let dx = expand_env_vars("%LOCALAPPDATA%\\D3DSCache");
    if let Ok(size) = dir_size(&dx) {
        entries.push(ShaderCacheEntry {
            gpu_vendor: "DirectX".to_string(),
            cache_path: dx.clone(),
            size_bytes: size,
            description: "DirectX 通用着色器缓存".to_string(),
        });
    }

    // Intel 着色器缓存
    let intel = expand_env_vars("%LOCALAPPDATA%\\Intel\\ShaderCache");
    if let Ok(size) = dir_size(&intel) {
        entries.push(ShaderCacheEntry {
            gpu_vendor: "Intel".to_string(),
            cache_path: intel.clone(),
            size_bytes: size,
            description: "Intel 着色器缓存".to_string(),
        });
    }

    entries
}

/// 清理着色器缓存
pub fn clean_shader_cache(vendor_filter: Option<Vec<String>>) -> Result<ShaderCleanResult, String> {
    let entries = get_shader_caches();
    let mut freed_bytes: u64 = 0;
    let mut cleaned_entries = Vec::new();
    let mut failed_entries = Vec::new();

    for entry in entries {
        // 如果有过滤器，只清理匹配的供应商
        if let Some(ref filter) = vendor_filter {
            if !filter.contains(&entry.gpu_vendor) {
                continue;
            }
        }

        let path = std::path::Path::new(&entry.cache_path);
        if path.is_dir() {
            let mut entry_freed: u64 = 0;
            let mut entry_failed = false;

            for walk in WalkDir::new(&entry.cache_path)
                .into_iter()
                .filter_map(|e| e.ok())
            {
                if walk.file_type().is_file() {
                    match std::fs::remove_file(walk.path()) {
                        Ok(_) => {
                            entry_freed += walk.metadata().map(|m| m.len()).unwrap_or(0);
                        }
                        Err(_) => {
                            entry_failed = true;
                        }
                    }
                }
            }

            freed_bytes += entry_freed;
            if entry_failed {
                failed_entries.push(entry.description.clone());
            } else if entry_freed > 0 {
                cleaned_entries.push(entry.description.clone());
            }
        }
    }

    Ok(ShaderCleanResult {
        freed_bytes,
        cleaned_entries,
        failed_entries,
    })
}
