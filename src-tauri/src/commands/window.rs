use tauri::{AppHandle, Manager};

#[tauri::command]
pub fn toggle_widget_window(app: AppHandle) {
    if let Some(widget) = app.get_webview_window("widget") {
        if widget.is_visible().unwrap_or(false) {
            let _ = widget.hide();
        } else {
            let _ = widget.show();
            let _ = widget.set_focus();
        }
    }
}

#[tauri::command]
pub fn toggle_overlay_window(app: AppHandle) {
    if let Some(overlay) = app.get_webview_window("overlay") {
        if overlay.is_visible().unwrap_or(false) {
            let _ = overlay.hide();
        } else {
            let _ = overlay.show();
            let _ = overlay.set_focus();
        }
    }
}
