use crate::models::launcher::LauncherConfig;
use std::fs;
use std::path::PathBuf;
use tauri::AppHandle;
use tauri::Manager;

/// 获取配置文件路径：{app_data_dir}/launcher.json
fn config_path(app: &AppHandle) -> PathBuf {
    let data_dir = app
        .path()
        .app_data_dir()
        .expect("failed to get app data dir");
    fs::create_dir_all(&data_dir).ok();
    data_dir.join("launcher.json")
}

/// 加载配置，如果文件不存在则返回空配置
pub fn load_config(app: &AppHandle) -> LauncherConfig {
    let path = config_path(app);
    if !path.exists() {
        return LauncherConfig { items: vec![] };
    }
    match fs::read_to_string(&path) {
        Ok(content) => serde_json::from_str(&content).unwrap_or(LauncherConfig { items: vec![] }),
        Err(_) => LauncherConfig { items: vec![] },
    }
}

/// 保存配置到 JSON 文件
pub fn save_config(app: &AppHandle, config: &LauncherConfig) -> Result<(), String> {
    let path = config_path(app);
    let content = serde_json::to_string_pretty(config).map_err(|e| format!("序列化失败: {}", e))?;
    fs::write(&path, &content).map_err(|e| format!("保存失败: {}", e))?;
    Ok(())
}
