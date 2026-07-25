use crate::models::display::{ColorFilter, FilterState};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;
use tauri::AppHandle;
use tauri::Manager;

static FILTER_ACTIVE: AtomicBool = AtomicBool::new(false);

struct FilterStateInner {
    current_filter: Option<ColorFilter>,
    intensity: f32,
}

static FILTER_STATE: Mutex<FilterStateInner> = Mutex::new(FilterStateInner {
    current_filter: None,
    intensity: 0.8,
});

pub fn get_filter_presets() -> Vec<ColorFilter> {
    vec![
        ColorFilter {
            id: "eye_protection".to_string(),
            name: "护眼模式".to_string(),
            description: "降低蓝光，暖色调".to_string(),
            r_multiplier: 1.0,
            g_multiplier: 0.85,
            b_multiplier: 0.6,
            opacity: 0.3,
            color_temperature: 3400,
        },
        ColorFilter {
            id: "night_vision".to_string(),
            name: "夜视模式".to_string(),
            description: "纯红色滤镜".to_string(),
            r_multiplier: 1.0,
            g_multiplier: 0.0,
            b_multiplier: 0.0,
            opacity: 0.35,
            color_temperature: 0,
        },
        ColorFilter {
            id: "color_blind".to_string(),
            name: "色盲辅助".to_string(),
            description: "减弱红绿对比".to_string(),
            r_multiplier: 0.8,
            g_multiplier: 1.0,
            b_multiplier: 0.8,
            opacity: 0.25,
            color_temperature: 0,
        },
    ]
}

pub fn get_filter_state() -> FilterState {
    let inner = FILTER_STATE.lock().unwrap();
    FilterState {
        active: FILTER_ACTIVE.load(Ordering::SeqCst),
        current_filter_id: inner.current_filter.as_ref().map(|f| f.id.clone()),
        intensity: inner.intensity,
    }
}

pub fn apply_color_filter(app: &AppHandle, filter_id: String, intensity: f32) -> Result<(), String> {
    let presets = get_filter_presets();
    let filter = presets.into_iter().find(|f| f.id == filter_id)
        .ok_or_else(|| format!("未找到滤镜: {}", filter_id))?;

    // Clamp intensity
    let intensity = intensity.clamp(0.0, 1.0);

    // Update state
    {
        let mut state = FILTER_STATE.lock().unwrap();
        state.current_filter = Some(filter);
        state.intensity = intensity;
    }
    FILTER_ACTIVE.store(true, Ordering::SeqCst);

    // Show or create the color-filter window
    if let Some(window) = app.get_webview_window("color-filter") {
        window.show().map_err(|e| e.to_string())?;
        window.set_focus().ok();
    }

    Ok(())
}

pub fn remove_color_filter(app: &AppHandle) -> Result<(), String> {
    FILTER_ACTIVE.store(false, Ordering::SeqCst);

    if let Some(window) = app.get_webview_window("color-filter") {
        window.hide().map_err(|e| e.to_string())?;
    }

    Ok(())
}
