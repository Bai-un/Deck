use crate::models::display::OverlayConfig;
use std::fs;
use std::path::PathBuf;
use tauri::AppHandle;
use tauri::Manager;

fn config_path(app: &AppHandle) -> PathBuf {
    let path = app
        .path()
        .app_data_dir()
        .unwrap_or_else(|_| PathBuf::from("."));
    path.join("overlay_config.json")
}

pub fn get_overlay_config(app: &AppHandle) -> OverlayConfig {
    let path = config_path(app);
    if path.exists() {
        if let Ok(content) = fs::read_to_string(&path) {
            if let Ok(config) = serde_json::from_str::<OverlayConfig>(&content) {
                return config;
            }
        }
    }
    OverlayConfig::default()
}

pub fn save_overlay_config(app: &AppHandle, config: &OverlayConfig) -> Result<(), String> {
    let path = config_path(app);

    // Ensure parent directory exists
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("创建目录失败: {}", e))?;
    }

    let content = serde_json::to_string_pretty(config).map_err(|e| format!("序列化失败: {}", e))?;
    fs::write(&path, content).map_err(|e| format!("写入配置失败: {}", e))?;

    Ok(())
}

pub fn toggle_overlay(app: &AppHandle, enabled: bool) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("overlay") {
        if enabled {
            window.show().map_err(|e| e.to_string())?;
        } else {
            window.hide().map_err(|e| e.to_string())?;
        }
        Ok(())
    } else {
        Err("覆盖面板窗口不可用".to_string())
    }
}
