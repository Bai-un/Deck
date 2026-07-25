use crate::models::display::{ColorFilter, DisplayInfo, FilterState, DLSSPreset, OverlayConfig, ResolutionPreset};
use crate::services::display::{dlss, filter, overlay, resolution};
use tauri::AppHandle;

#[tauri::command]
pub fn get_filter_presets() -> Vec<ColorFilter> {
    filter::get_filter_presets()
}

#[tauri::command]
pub fn get_filter_state() -> FilterState {
    filter::get_filter_state()
}

#[tauri::command]
pub fn apply_color_filter(app: AppHandle, filter_id: String, intensity: f32) -> Result<(), String> {
    filter::apply_color_filter(&app, filter_id, intensity)
}

#[tauri::command]
pub fn remove_color_filter(app: AppHandle) -> Result<(), String> {
    filter::remove_color_filter(&app)
}

#[tauri::command]
pub fn get_dlss_presets() -> Vec<DLSSPreset> {
    dlss::get_dlss_presets()
}

#[tauri::command]
pub fn set_dlss_preset(preset_id: String) -> Result<(), String> {
    dlss::set_dlss_preset(&preset_id)
}

#[tauri::command]
pub fn is_nvidia_available() -> bool {
    dlss::is_nvidia_available()
}

#[tauri::command]
pub fn get_display_info() -> Result<DisplayInfo, String> {
    resolution::get_display_info()
}

#[tauri::command]
pub fn get_available_resolutions() -> Vec<ResolutionPreset> {
    resolution::get_available_resolutions()
}

#[tauri::command]
pub fn set_resolution(width: u32, height: u32, refresh_rate: u32) -> Result<(), String> {
    resolution::set_resolution(width, height, refresh_rate)
}

#[tauri::command]
pub fn calculate_custom_resolution(
    native_width: u32,
    native_height: u32,
    target_ratio: String,
    scale_percent: u32,
) -> (u32, u32) {
    resolution::calculate_custom_resolution(native_width, native_height, &target_ratio, scale_percent)
}

#[tauri::command]
pub fn reset_to_native_resolution() -> Result<(), String> {
    resolution::reset_to_native()
}

#[tauri::command]
pub fn get_overlay_config(app: AppHandle) -> OverlayConfig {
    overlay::get_overlay_config(&app)
}

#[tauri::command]
pub fn save_overlay_config(app: AppHandle, config: OverlayConfig) -> Result<(), String> {
    overlay::save_overlay_config(&app, &config)
}

#[tauri::command]
pub fn toggle_overlay(app: AppHandle, enabled: bool) -> Result<(), String> {
    overlay::toggle_overlay(&app, enabled)
}
