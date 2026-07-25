use std::process::Command;
use winreg::enums::*;
use winreg::{RegKey, HKEY};
use crate::models::tuning::StartupItem;

const HKCU_RUN_PATH: &str = r"Software\Microsoft\Windows\CurrentVersion\Run";
const HKLM_RUN_PATH: &str = r"Software\Microsoft\Windows\CurrentVersion\Run";
const HKCU_APPROVED_PATH: &str = r"Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\Run";

fn estimate_impact(name: &str, command: &str) -> String {
    let combined = format!("{} {}", name, command).to_lowercase();
    if combined.contains("onedrive") || combined.contains("adobe") || combined.contains("java")
        || combined.contains("update") || combined.contains("microsoft edge")
    {
        "high".into()
    } else if combined.contains("steam") || combined.contains("discord") || combined.contains("epic")
        || combined.contains("spotify") || combined.contains("telegram")
    {
        "medium".into()
    } else {
        "low".into()
    }
}

fn read_registry_startup(hive: HKEY, path: &str, source: &str) -> Vec<StartupItem> {
    let mut items = Vec::new();
    if let Ok(key) = RegKey::predef(hive).open_subkey_with_flags(path, KEY_READ) {
        for entry in key.enum_values().flatten() {
            let name = entry.0;
            let cmd = match entry.1 {
                winreg::RegValue { bytes, vtype: _ } => String::from_utf8_lossy(&bytes).to_string(),
            };

            let id = format!("{}_{}", source, name.replace(' ', "_"));
            let publisher = extract_publisher(&cmd);

            items.push(StartupItem {
                id: id.clone(),
                name: name.clone(),
                publisher,
                command: cmd,
                source: source.to_string(),
                enabled: is_startup_enabled_by_name(&name),
                impact: "medium".into(),
            });
        }
    }
    items
}

fn extract_publisher(command: &str) -> String {
    // Try to get file version info from the executable
    let path = command.trim_matches('"').split(' ').next().unwrap_or("").to_string();
    if path.is_empty() {
        return "未知".into();
    }
    // Simple heuristic: extract company from path
    let parts: Vec<&str> = path.split('\\').collect();
    parts.get(parts.len().wrapping_sub(2)).copied().unwrap_or("未知").to_string()
}

fn is_startup_enabled_by_name(name: &str) -> bool {
    // Check StartupApproved registry by original value name
    if let Ok(key) = RegKey::predef(HKEY_CURRENT_USER).open_subkey_with_flags(HKCU_APPROVED_PATH, KEY_READ) {
        if let Ok(val) = key.get_raw_value(name) {
            // First byte: 02 = enabled, 03 = disabled
            return val.bytes.first().copied() == Some(0x02);
        }
    }
    true // default enabled
}

/// 获取所有启动项
pub fn get_startup_items() -> Vec<StartupItem> {
    let mut items = Vec::new();

    // Read HKCU Run
    items.extend(read_registry_startup(
        HKEY_CURRENT_USER,
        HKCU_RUN_PATH,
        "registry_hkcu",
    ));

    // Read HKLM Run
    items.extend(read_registry_startup(
        HKEY_LOCAL_MACHINE,
        HKLM_RUN_PATH,
        "registry_hklm",
    ));

    // Estimate impacts
    for item in &mut items {
        item.impact = estimate_impact(&item.name, &item.command);
    }

    items
}

/// 启用/禁用启动项
pub fn toggle_startup_item(id: &str, enabled: bool) -> Result<(), String> {
    // Extract the original name from id ("registry_hkcu_Discord" -> "Discord")
    let name = id.splitn(2, '_').nth(1).unwrap_or(id);
    let key = RegKey::predef(HKEY_CURRENT_USER)
        .open_subkey_with_flags(HKCU_APPROVED_PATH, KEY_WRITE)
        .map_err(|e| format!("无法打开 StartupApproved: {}", e))?;

    let bytes: Vec<u8> = if enabled { vec![0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00] }
        else { vec![0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00] };

    key.set_raw_value(name, &winreg::RegValue { bytes, vtype: REG_BINARY })
        .map_err(|e| format!("设置启动状态失败: {}", e))?;

    Ok(())
}

/// 删除启动项
pub fn remove_startup_item(id: &str) -> Result<(), String> {
    let name = id.splitn(2, '_').nth(1).unwrap_or(id);
    let source = id.splitn(2, '_').next().unwrap_or("registry_hkcu");

    let path = match source {
        "registry_hkcu" => HKCU_RUN_PATH,
        "registry_hklm" => HKLM_RUN_PATH,
        _ => return Err("未知来源".to_string()),
    };
    let hive = match source {
        "registry_hkcu" => HKEY_CURRENT_USER,
        "registry_hklm" => HKEY_LOCAL_MACHINE,
        _ => return Err("未知来源".to_string()),
    };

    let key = RegKey::predef(hive)
        .open_subkey_with_flags(path, KEY_WRITE)
        .map_err(|e| format!("无法打开注册表: {}", e))?;

    key.delete_value(name).map_err(|e| format!("删除失败: {}", e))?;
    Ok(())
}

/// 打开启动项所在目录
pub fn open_startup_item_location(id: &str) -> Result<(), String> {
    let items = get_startup_items();
    let item = items.iter().find(|i| i.id == id)
        .ok_or_else(|| "未找到启动项".to_string())?;

    let path = item.command.trim_matches('"').split(' ').next().unwrap_or("");
    if path.is_empty() {
        return Err("无法解析路径".to_string());
    }

    Command::new("explorer")
        .args(["/select,", path])
        .spawn()
        .map_err(|e| format!("打开位置失败: {}", e))?;

    Ok(())
}
