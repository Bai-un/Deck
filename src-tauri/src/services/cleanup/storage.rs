use crate::models::cleanup::{ScanCategory, StorageCleanResult, StorageScanResult};
use std::time::Instant;
use walkdir::WalkDir;

/// 展开环境变量 %VAR% 为实际值
fn expand_env_vars(path: &str) -> String {
    let mut result = path.to_string();
    // 替换 %LOCALAPPDATA%
    if let Ok(val) = std::env::var("LOCALAPPDATA") {
        result = result.replace("%LOCALAPPDATA%", &val);
    }
    // 替换 %APPDATA%
    if let Ok(val) = std::env::var("APPDATA") {
        result = result.replace("%APPDATA%", &val);
    }
    // 替换 %TEMP%
    if let Ok(val) = std::env::var("TEMP") {
        result = result.replace("%TEMP%", &val);
    }
    // 替换 %USERPROFILE%
    if let Ok(val) = std::env::var("USERPROFILE") {
        result = result.replace("%USERPROFILE%", &val);
    }
    // 替换 %SYSTEMROOT%
    if let Ok(val) = std::env::var("SYSTEMROOT") {
        result = result.replace("%SYSTEMROOT%", &val);
    }
    result
}

/// 计算目录总大小和文件数
fn dir_stats(path: &str) -> (u64, u64) {
    let mut total_size: u64 = 0;
    let mut file_count: u64 = 0;
    for entry in WalkDir::new(path).into_iter().filter_map(|e| e.ok()) {
        if entry.file_type().is_file() {
            total_size += entry.metadata().map(|m| m.len()).unwrap_or(0);
            file_count += 1;
        }
    }
    (total_size, file_count)
}

/// 带通配符的路径解析：如果路径不含 *，直接检查；否则枚举父目录匹配
fn resolve_paths(template: &str) -> Vec<String> {
    if !template.contains('*') {
        let expanded = expand_env_vars(template);
        if std::path::Path::new(&expanded).exists() {
            return vec![expanded];
        }
        return vec![];
    }

    // 处理通配符：如 Profiles\* 这样的路径
    let expanded = expand_env_vars(template);
    let path = std::path::Path::new(&expanded);

    // 找出通配符前的父目录
    let mut parent = path.parent().unwrap_or(std::path::Path::new(""));
    let mut wildcard_part = path.file_name().and_then(|s| s.to_str()).unwrap_or("");

    // 如果有目录层级包含 *
    if let Some(p) = path.parent() {
        if p.to_string_lossy().contains('*') {
            // 多级通配符，简化处理：尝试直接展开
            parent = std::path::Path::new("");
            wildcard_part = "";
        }
    }

    let mut results = Vec::new();
    if parent.exists() {
        if let Ok(entries) = std::fs::read_dir(parent) {
            for entry in entries.flatten() {
                let name = entry.file_name().to_string_lossy().to_string();
                if let Some(pattern) = wildcard_part.strip_suffix('*') {
                    if name.starts_with(pattern) || wildcard_part == "*" {
                        let matched = entry.path().join("cache2");
                        if matched.exists() {
                            results.push(matched.to_string_lossy().to_string());
                        }
                        // 也匹配目录本身
                        let dir_path = entry.path();
                        if dir_path.is_dir() {
                            results.push(dir_path.to_string_lossy().to_string());
                        }
                    }
                }
            }
        }
    }
    results
}

/// 扫描类别定义
struct ScanCategoryDef {
    id: &'static str,
    name: &'static str,
    description: &'static str,
    paths: Vec<&'static str>,
    safe: bool,
}

fn get_scan_categories() -> Vec<ScanCategoryDef> {
    vec![
        ScanCategoryDef {
            id: "windows_temp",
            name: "Windows 临时文件",
            description: "系统和应用程序临时文件",
            paths: vec![
                "%TEMP%",
                "C:\\Windows\\Temp",
            ],
            safe: true,
        },
        ScanCategoryDef {
            id: "browser_cache",
            name: "浏览器缓存",
            description: "Chrome / Edge / Firefox 浏览器缓存",
            paths: vec![
                "%LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default\\Cache",
                "%LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default\\Code Cache",
                "%LOCALAPPDATA%\\Microsoft\\Edge\\User Data\\Default\\Cache",
                "%LOCALAPPDATA%\\Microsoft\\Edge\\User Data\\Default\\Code Cache",
                "%LOCALAPPDATA%\\Mozilla\\Firefox\\Profiles\\*\\cache2",
            ],
            safe: true,
        },
        ScanCategoryDef {
            id: "thumbnails",
            name: "缩略图缓存",
            description: "Windows 资源管理器缩略图数据库",
            paths: vec![
                "%LOCALAPPDATA%\\Microsoft\\Windows\\Explorer",
            ],
            safe: true,
        },
        ScanCategoryDef {
            id: "windows_prefetch",
            name: "Windows Prefetch",
            description: "Windows 预取文件，加快程序启动速度",
            paths: vec![
                "C:\\Windows\\Prefetch",
            ],
            safe: true,
        },
        ScanCategoryDef {
            id: "recent_files",
            name: "最近文件记录",
            description: "最近打开的文件和程序快捷方式记录",
            paths: vec![
                "%APPDATA%\\Microsoft\\Windows\\Recent",
            ],
            safe: false,
        },
        ScanCategoryDef {
            id: "download_cache",
            name: "下载缓存",
            description: "Internet Explorer / Edge 下载缓存",
            paths: vec![
                "%LOCALAPPDATA%\\Microsoft\\Windows\\INetCache",
            ],
            safe: true,
        },
    ]
}

/// 扫描所有类别
pub fn scan_storage() -> Result<StorageScanResult, String> {
    let start = Instant::now();
    let mut categories = Vec::new();

    for def in get_scan_categories() {
        let mut total_size: u64 = 0;
        let mut file_count: u64 = 0;
        let mut resolved_paths = Vec::new();

        for path_template in &def.paths {
            if path_template.contains('*') {
                let paths = resolve_paths(path_template);
                for p in paths {
                    if std::path::Path::new(&p).is_dir() {
                        let (s, c) = dir_stats(&p);
                        total_size += s;
                        file_count += c;
                        resolved_paths.push(p);
                    }
                }
            } else {
                let path = expand_env_vars(path_template);
                let p = std::path::Path::new(&path);
                if p.is_dir() {
                    let (s, c) = dir_stats(&path);
                    total_size += s;
                    file_count += c;
                    resolved_paths.push(path);
                } else if p.is_file() {
                    total_size += p.metadata().map(|m| m.len()).unwrap_or(0);
                    file_count += 1;
                    resolved_paths.push(path);
                }
            }
        }

        if total_size > 0 || !resolved_paths.is_empty() {
            categories.push(ScanCategory {
                id: def.id.to_string(),
                name: def.name.to_string(),
                description: def.description.to_string(),
                size_bytes: total_size,
                file_count,
                paths: resolved_paths,
                safe_to_clean: def.safe,
            });
        }
    }

    Ok(StorageScanResult {
        total_size_bytes: categories.iter().map(|c| c.size_bytes).sum(),
        categories,
        scan_duration_ms: start.elapsed().as_millis() as u64,
    })
}

/// 清理选中的类别
pub fn clean_storage(category_ids: Vec<String>) -> Result<StorageCleanResult, String> {
    let defs = get_scan_categories();
    let mut freed_bytes: u64 = 0;
    let mut freed_file_count: u64 = 0;
    let mut failed_items = Vec::new();

    for def in &defs {
        if !category_ids.contains(&def.id.to_string()) {
            continue;
        }

        for path_template in &def.paths {
            let paths: Vec<String> = if path_template.contains('*') {
                resolve_paths(path_template)
            } else {
                let p = expand_env_vars(path_template);
                if std::path::Path::new(&p).exists() {
                    vec![p]
                } else {
                    vec![]
                }
            };

            for path in paths {
                let p = std::path::Path::new(&path);
                if p.is_dir() {
                    for entry in WalkDir::new(&path).into_iter().filter_map(|e| e.ok()) {
                        if entry.file_type().is_file() {
                            match std::fs::remove_file(entry.path()) {
                                Ok(_) => {
                                    freed_bytes += entry.metadata().map(|m| m.len()).unwrap_or(0);
                                    freed_file_count += 1;
                                }
                                Err(_) => {
                                    failed_items.push(entry.path().to_string_lossy().to_string());
                                }
                            }
                        }
                    }
                } else if p.is_file() {
                    match std::fs::remove_file(p) {
                        Ok(_) => {
                            freed_bytes += p.metadata().map(|m| m.len()).unwrap_or(0);
                            freed_file_count += 1;
                        }
                        Err(_) => {
                            failed_items.push(path);
                        }
                    }
                }
            }
        }
    }

    Ok(StorageCleanResult {
        freed_bytes,
        freed_file_count,
        failed_items,
    })
}
