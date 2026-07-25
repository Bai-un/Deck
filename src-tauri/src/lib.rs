mod commands;
mod models;
mod services;
mod utils;

use services::hardware::HardwareMonitor;
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::MouseButton,
    tray::TrayIconBuilder,
    Emitter, Manager, WindowEvent,
};

fn setup_tray(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let show = MenuItem::with_id(app, "show", "显示主窗口", true, None::<&str>)?;
    let sep1 = PredefinedMenuItem::separator(app)?;
    let toggle_widget =
        MenuItem::with_id(app, "toggle_widget", "悬浮窗", true, None::<&str>)?;
    let toggle_overlay =
        MenuItem::with_id(app, "toggle_overlay", "悬浮面板", true, None::<&str>)?;
    let toggle_filter =
        MenuItem::with_id(app, "toggle_filter", "色彩滤镜", true, None::<&str>)?;
    let sep2 = PredefinedMenuItem::separator(app)?;
    let settings = MenuItem::with_id(app, "settings", "设置", true, None::<&str>)?;
    let about = MenuItem::with_id(app, "about", "关于", true, None::<&str>)?;
    let sep3 = PredefinedMenuItem::separator(app)?;
    let quit = MenuItem::with_id(app, "quit", "退出 Deck", true, None::<&str>)?;

    let menu = Menu::with_items(
        app,
        &[
            &show,
            &sep1,
            &toggle_widget,
            &toggle_overlay,
            &toggle_filter,
            &sep2,
            &settings,
            &about,
            &sep3,
            &quit,
        ],
    )?;

    TrayIconBuilder::new()
        .icon_as_template(true)
        .menu(&menu)
        .tooltip("Deck")
        .on_menu_event(|app, event| match event.id.as_ref() {
            "show" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            "toggle_widget" => {
                if let Some(window) = app.get_webview_window("widget") {
                    if window.is_visible().unwrap_or(false) {
                        let _ = window.hide();
                    } else {
                        let _ = window.show();
                    }
                }
            }
            "toggle_overlay" => {
                if let Some(window) = app.get_webview_window("overlay") {
                    if window.is_visible().unwrap_or(false) {
                        let _ = window.hide();
                    } else {
                        let _ = window.show();
                    }
                }
            }
            "toggle_filter" => {
                if let Some(window) = app.get_webview_window("color-filter") {
                    if window.is_visible().unwrap_or(false) {
                        let _ = window.hide();
                    } else {
                        let _ = window.show();
                    }
                }
            }
            "settings" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                    let _ = window.emit("navigate", "/settings");
                }
            }
            "about" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                    let _ = window.emit("navigate", "/settings");
                    let _ = window.emit("show-about", ());
                }
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let tauri::tray::TrayIconEvent::Click {
                button: MouseButton::Left,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    if window.is_visible().unwrap_or(false) {
                        let _ = window.hide();
                    } else {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
            }
        })
        .build(app)?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_single_instance::init(|_, _, _| {}))
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .manage(HardwareMonitor::new())
        .invoke_handler(tauri::generate_handler![
            commands::system::get_system_info,
            commands::system::get_app_version,
            commands::window::toggle_widget_window,
            commands::window::toggle_overlay_window,
            commands::hardware::get_hardware_info,
            commands::hardware::get_sensor_snapshot,
            commands::hardware::start_hardware_monitor,
            commands::hardware::stop_hardware_monitor,
            commands::hardware::set_monitor_interval,
            commands::launcher::get_launcher_items,
            commands::launcher::add_launcher_item,
            commands::launcher::remove_launcher_item,
            commands::launcher::reorder_launcher_items,
            commands::launcher::launch_app,
            commands::launcher::rename_launcher_item,
            commands::launcher::open_file_location,
            commands::cleanup::get_memory_status,
            commands::cleanup::cleanup_memory,
            commands::cleanup::scan_storage,
            commands::cleanup::clean_storage,
            commands::cleanup::get_shader_caches,
            commands::cleanup::clean_shader_cache,
            commands::tuning::get_network_tweaks,
            commands::tuning::apply_network_tweak,
            commands::tuning::reset_network_tweaks,
            commands::tuning::get_power_plans,
            commands::tuning::activate_power_plan,
            commands::tuning::create_deck_power_plan,
            commands::tuning::delete_power_plan,
            commands::tuning::get_startup_items,
            commands::tuning::toggle_startup_item,
            commands::tuning::remove_startup_item,
            commands::tuning::open_startup_item_location,
            commands::tuning::get_peripheral_tweaks,
            commands::tuning::apply_peripheral_tweak,
            commands::tuning::reset_peripheral_tweaks,
            commands::display::get_filter_presets,
            commands::display::get_filter_state,
            commands::display::apply_color_filter,
            commands::display::remove_color_filter,
            commands::display::get_dlss_presets,
            commands::display::set_dlss_preset,
            commands::display::is_nvidia_available,
            commands::display::get_display_info,
            commands::display::get_available_resolutions,
            commands::display::set_resolution,
            commands::display::calculate_custom_resolution,
            commands::display::reset_to_native_resolution,
            commands::display::get_overlay_config,
            commands::display::save_overlay_config,
            commands::display::toggle_overlay,
            commands::tools::get_disk_health,
            commands::tools::get_gpu_rename_info,
            commands::tools::rename_gpu,
            commands::tools::restore_gpu_name,
            commands::tools::get_nvidia_driver_info,
            commands::tools::check_nvidia_driver_update,
            commands::tools::get_builtin_tools,
            commands::tools::launch_builtin_tool,
        ])
        .setup(|app| {
            setup_tray(app)?;
            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                // Minimize to tray instead of closing
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running Deck");
}
