use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct SystemInfo {
    pub os_version: String,
    pub cpu_model: String,
    pub gpu_model: String,
    pub total_memory: String,
    pub disks: Vec<String>,
}

#[tauri::command]
pub fn get_system_info() -> SystemInfo {
    SystemInfo {
        os_version: std::env::consts::OS.to_string(),
        cpu_model: "Unknown".to_string(),
        gpu_model: "Unknown".to_string(),
        total_memory: "Unknown".to_string(),
        disks: Vec::new(),
    }
}

#[tauri::command]
pub async fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}
