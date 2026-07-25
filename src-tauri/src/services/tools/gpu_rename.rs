use crate::models::tools::GpuRenameInfo;
use winreg::enums::*;
use winreg::RegKey;

const GPU_CLASS_GUID: &str = "{4d36e968-e325-11ce-bfc1-08002be10318}";
const REG_PATH: &str = r"SYSTEM\CurrentControlSet\Control\Class\GPU_CLASS_GUID";

fn build_reg_path() -> String {
    REG_PATH.replace("GPU_CLASS_GUID", GPU_CLASS_GUID)
}

/// Get GPU rename info for all GPUs found in the registry.
pub fn get_gpu_rename_info() -> Result<Vec<GpuRenameInfo>, String> {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let class_key = hklm
        .open_subkey_with_flags(&build_reg_path(), KEY_READ)
        .map_err(|e| format!("无法打开 GPU 注册表项: {}", e))?;

    let mut gpus = Vec::new();

    // Enumerate subkeys 0000, 0001, ...
    for i in 0..16 {
        let sub_key_name = format!("{:04}", i);
        if let Ok(sub_key) = class_key.open_subkey_with_flags(&sub_key_name, KEY_READ) {
            // Check DriverDesc (current display name)
            let current_name: String = match sub_key.get_value("DriverDesc") {
                Ok(n) => n,
                Err(_) => continue,
            };

            // Try to get original name from HardwareInformation.ChipType or similar
            let original_name: String = sub_key
                .get_value("HardwareInformation.ChipType")
                .unwrap_or_else(|_| current_name.clone());

            let is_renamed = current_name != original_name;

            let registry_path = format!(
                r"HKLM\SYSTEM\CurrentControlSet\Control\Class\{{{}}}\{}",
                GPU_CLASS_GUID.trim_matches('{').trim_matches('}'),
                sub_key_name
            );

            gpus.push(GpuRenameInfo {
                gpu_index: i,
                original_name: original_name.clone(),
                current_name,
                is_renamed,
                registry_path,
            });
        }
    }

    if gpus.is_empty() {
        // Mock for non-admin / non-Windows
        gpus.push(GpuRenameInfo {
            gpu_index: 0,
            original_name: "NVIDIA GeForce RTX 4060".into(),
            current_name: "NVIDIA GeForce RTX 4060".into(),
            is_renamed: false,
            registry_path: format!(
                r"HKLM\...\{{{}}}\0000",
                GPU_CLASS_GUID.trim_matches('{').trim_matches('}')
            ),
        });
    }

    Ok(gpus)
}

/// Rename a GPU's display name in the registry.
/// Requires admin privileges.
pub fn rename_gpu(gpu_index: u32, new_name: &str) -> Result<(), String> {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let sub_key_name = format!("{:04}", gpu_index);
    let path = build_reg_path();

    let class_key = hklm
        .open_subkey_with_flags(&path, KEY_WRITE)
        .map_err(|e| format!("无法打开注册表键（需要管理员权限）: {}", e))?;

    let sub_key = class_key
        .open_subkey_with_flags(&sub_key_name, KEY_WRITE)
        .map_err(|e| format!("无法打开 GPU {} 注册表项: {}", gpu_index, e))?;

    sub_key
        .set_value("DriverDesc", &new_name)
        .map_err(|e| format!("写入注册表失败: {}", e))?;

    Ok(())
}

/// Restore GPU original name from chip type info.
pub fn restore_gpu_name(gpu_index: u32) -> Result<(), String> {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let sub_key_name = format!("{:04}", gpu_index);
    let path = build_reg_path();

    let class_key = hklm
        .open_subkey_with_flags(&path, KEY_WRITE)
        .map_err(|e| format!("无法打开注册表键（需要管理员权限）: {}", e))?;

    let sub_key = class_key
        .open_subkey_with_flags(&sub_key_name, KEY_READ | KEY_WRITE)
        .map_err(|e| format!("无法打开 GPU {} 注册表项: {}", gpu_index, e))?;

    let original_name: String = sub_key
        .get_value("HardwareInformation.ChipType")
        .map_err(|_| "无法获取原始 GPU 名称".to_string())?;

    sub_key
        .set_value("DriverDesc", &original_name)
        .map_err(|e| format!("写入注册表失败: {}", e))?;

    Ok(())
}
