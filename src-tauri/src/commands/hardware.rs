use tauri::{AppHandle, State};

use crate::models::hardware::{SensorSnapshot, SystemInfo};
use crate::services::hardware::HardwareMonitor;

/// 获取系统静态硬件信息（前端初始化时调用一次）
#[tauri::command]
pub fn get_hardware_info(
    state: State<'_, HardwareMonitor>,
) -> Result<SystemInfo, String> {
    Ok(state.inner().get_static_info())
}

/// 获取一次传感器快照（前端手动刷新用）
#[tauri::command]
pub fn get_sensor_snapshot(
    state: State<'_, HardwareMonitor>,
) -> Result<SensorSnapshot, String> {
    Ok(state.inner().collect_snapshot())
}

/// 启动传感器后台监控（前端进入硬件页面时调用）
#[tauri::command]
pub fn start_hardware_monitor(
    app: AppHandle,
    state: State<'_, HardwareMonitor>,
    interval_ms: Option<u64>,
) -> Result<(), String> {
    if state.inner().is_running() {
        return Err("Monitor already running".to_string());
    }
    let interval = interval_ms.unwrap_or(1000).clamp(200, 5000);
    state.inner().start(app, interval);
    log::info!("Hardware monitor started with interval {}ms", interval);
    Ok(())
}

/// 停止传感器后台监控（前端离开硬件页面时调用）
#[tauri::command]
pub fn stop_hardware_monitor(
    state: State<'_, HardwareMonitor>,
) -> Result<(), String> {
    if !state.inner().is_running() {
        return Err("Monitor not running".to_string());
    }
    state.inner().stop();
    log::info!("Hardware monitor stopped");
    Ok(())
}

/// 设置采集间隔
#[tauri::command]
pub fn set_monitor_interval(
    state: State<'_, HardwareMonitor>,
    interval_ms: u64,
) -> Result<(), String> {
    let clamped = interval_ms.clamp(200, 5000);
    if state.inner().is_running() {
        return Err("Cannot change interval while monitor is running. Stop first.".to_string());
    }
    log::info!("Monitor interval set to {}ms", clamped);
    Ok(())
}
