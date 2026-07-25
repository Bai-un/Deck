use crate::models::tools::*;
use crate::services::tools;

#[tauri::command]
pub fn get_disk_health() -> Result<Vec<DiskHealth>, String> {
    tools::disk_health::get_disk_health()
}

#[tauri::command]
pub fn get_gpu_rename_info() -> Result<Vec<GpuRenameInfo>, String> {
    tools::gpu_rename::get_gpu_rename_info()
}

#[tauri::command]
pub fn rename_gpu(gpu_index: u32, new_name: String) -> Result<(), String> {
    tools::gpu_rename::rename_gpu(gpu_index, &new_name)
}

#[tauri::command]
pub fn restore_gpu_name(gpu_index: u32) -> Result<(), String> {
    tools::gpu_rename::restore_gpu_name(gpu_index)
}

#[tauri::command]
pub fn get_nvidia_driver_info() -> Result<NvidiaDriverInfo, String> {
    tools::nvidia_driver::get_driver_info()
}

#[tauri::command]
pub async fn check_nvidia_driver_update() -> Result<Option<String>, String> {
    tools::nvidia_driver::check_latest_driver().await
}

#[tauri::command]
pub fn get_builtin_tools() -> Vec<BuiltinTool> {
    tools::builtin_tools::get_builtin_tools()
}

#[tauri::command]
pub fn launch_builtin_tool(command: String) -> Result<(), String> {
    tools::builtin_tools::launch_tool(&command)
}
