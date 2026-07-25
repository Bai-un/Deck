use crate::models::tuning::*;
use crate::services::tuning;

// ========== 网络调优 ==========

#[tauri::command]
pub fn get_network_tweaks() -> Vec<NetworkTweak> {
    tuning::network::get_network_tweaks()
}

#[tauri::command]
pub fn apply_network_tweak(tweak_id: String, value: String) -> Result<NetworkTweakResult, String> {
    tuning::network::apply_network_tweak(&tweak_id, &value)
}

#[tauri::command]
pub fn reset_network_tweaks() -> Result<Vec<NetworkTweakResult>, String> {
    tuning::network::reset_network_tweaks()
}

// ========== 电源管理 ==========

#[tauri::command]
pub fn get_power_plans() -> Vec<PowerPlan> {
    tuning::power::get_power_plans()
}

#[tauri::command]
pub fn activate_power_plan(guid: String) -> Result<(), String> {
    tuning::power::activate_power_plan(&guid)
}

#[tauri::command]
pub fn create_deck_power_plan() -> Result<PowerPlan, String> {
    tuning::power::create_deck_power_plan()
}

#[tauri::command]
pub fn delete_power_plan(guid: String) -> Result<(), String> {
    tuning::power::delete_power_plan(&guid)
}

// ========== 启动项管理 ==========

#[tauri::command]
pub fn get_startup_items() -> Vec<StartupItem> {
    tuning::startup::get_startup_items()
}

#[tauri::command]
pub fn toggle_startup_item(id: String, enabled: bool) -> Result<(), String> {
    tuning::startup::toggle_startup_item(&id, enabled)
}

#[tauri::command]
pub fn remove_startup_item(id: String) -> Result<(), String> {
    tuning::startup::remove_startup_item(&id)
}

#[tauri::command]
pub fn open_startup_item_location(id: String) -> Result<(), String> {
    tuning::startup::open_startup_item_location(&id)
}

// ========== 外设优化 ==========

#[tauri::command]
pub fn get_peripheral_tweaks() -> Vec<PeripheralTweak> {
    tuning::peripheral::get_peripheral_tweaks()
}

#[tauri::command]
pub fn apply_peripheral_tweak(tweak_id: String, value: String) -> Result<(), String> {
    tuning::peripheral::apply_peripheral_tweak(&tweak_id, &value)
}

#[tauri::command]
pub fn reset_peripheral_tweaks() -> Result<(), String> {
    tuning::peripheral::reset_peripheral_tweaks()
}
