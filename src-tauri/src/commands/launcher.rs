use crate::models::launcher::{LauncherConfig, LauncherItem};
use crate::services::launcher;
use tauri::AppHandle;
use uuid::Uuid;

/// 获取所有启动项列表
#[tauri::command]
pub fn get_launcher_items(app: AppHandle) -> Vec<LauncherItem> {
    let config = launcher::load_config(&app);
    config.items
}

/// 添加新启动项
#[tauri::command]
pub fn add_launcher_item(
    app: AppHandle,
    exe_path: String,
    custom_name: Option<String>,
) -> Result<LauncherItem, String> {
    let path = std::path::Path::new(&exe_path);
    if !path.exists() {
        return Err(format!("程序不存在: {}", exe_path));
    }
    if !exe_path.to_lowercase().ends_with(".exe") {
        return Err("请选择 .exe 可执行文件".to_string());
    }

    let name = custom_name.unwrap_or_else(|| {
        path.file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("Unknown")
            .to_string()
    });

    let icon_base64 = launcher::extract_icon(&exe_path);

    let mut config: LauncherConfig = launcher::load_config(&app);
    let max_order = config.items.iter().map(|i| i.sort_order).max().unwrap_or(0);

    let item = LauncherItem {
        id: Uuid::new_v4().to_string(),
        name,
        exe_path: exe_path.clone(),
        icon_base64,
        added_at: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64,
        sort_order: max_order + 1,
    };

    config.items.push(item.clone());
    launcher::save_config(&app, &config)?;

    Ok(item)
}

/// 删除启动项
#[tauri::command]
pub fn remove_launcher_item(app: AppHandle, id: String) -> Result<(), String> {
    let mut config = launcher::load_config(&app);
    let len_before = config.items.len();
    config.items.retain(|i| i.id != id);
    if config.items.len() == len_before {
        return Err("未找到该启动项".to_string());
    }
    launcher::save_config(&app, &config)
}

/// 更新启动项排序
#[tauri::command]
pub fn reorder_launcher_items(app: AppHandle, item_ids: Vec<String>) -> Result<(), String> {
    let mut config = launcher::load_config(&app);

    for (order, id) in item_ids.iter().enumerate() {
        if let Some(item) = config.items.iter_mut().find(|i| &i.id == id) {
            item.sort_order = order as u32;
        }
    }

    config.items.sort_by_key(|i| i.sort_order);
    launcher::save_config(&app, &config)
}

/// 启动程序
#[tauri::command]
pub fn launch_app(exe_path: String) -> Result<(), String> {
    launcher::launch_app(&exe_path)
}

/// 重命名启动项
#[tauri::command]
pub fn rename_launcher_item(app: AppHandle, id: String, new_name: String) -> Result<(), String> {
    if new_name.trim().is_empty() {
        return Err("名称不能为空".to_string());
    }

    let mut config = launcher::load_config(&app);
    let item = config
        .items
        .iter_mut()
        .find(|i| i.id == id)
        .ok_or_else(|| "未找到该启动项".to_string())?;

    item.name = new_name.trim().to_string();
    launcher::save_config(&app, &config)
}

/// 打开文件位置
#[tauri::command]
pub fn open_file_location(exe_path: String) -> Result<(), String> {
    launcher::open_file_location(&exe_path)
}
