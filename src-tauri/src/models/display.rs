use serde::{Deserialize, Serialize};

// ========== Color Filter ==========

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ColorFilter {
    pub id: String,
    pub name: String,
    pub description: String,
    pub r_multiplier: f32,
    pub g_multiplier: f32,
    pub b_multiplier: f32,
    pub opacity: f32,
    pub color_temperature: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FilterState {
    pub active: bool,
    pub current_filter_id: Option<String>,
    pub intensity: f32,
}

// ========== DLSS ==========

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DLSSPreset {
    pub id: String,
    pub name: String,
    pub description: String,
    pub render_scale: f32,
    pub is_active: bool,
}

// ========== Resolution ==========

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResolutionPreset {
    pub id: String,
    pub name: String,
    pub width: u32,
    pub height: u32,
    pub refresh_rate: u32,
    pub aspect_ratio: String,
    pub is_current: bool,
    pub is_native: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DisplayInfo {
    pub name: String,
    pub native_width: u32,
    pub native_height: u32,
    pub current_width: u32,
    pub current_height: u32,
    pub current_refresh_rate: u32,
    pub available_rates: Vec<u32>,
    pub scale_factor: f64,
}

// ========== Overlay ==========

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OverlayConfig {
    pub enabled: bool,
    pub show_cpu: bool,
    pub show_gpu: bool,
    pub show_memory: bool,
    pub show_disk: bool,
    pub show_fps: bool,
    pub show_time: bool,
    pub position: String,
    pub opacity: f32,
    pub font_size: u32,
    pub background_blur: bool,
    pub refresh_rate_ms: u32,
}

impl Default for OverlayConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            show_cpu: true,
            show_gpu: true,
            show_memory: true,
            show_disk: false,
            show_fps: true,
            show_time: false,
            position: "top_left".to_string(),
            opacity: 0.8,
            font_size: 14,
            background_blur: true,
            refresh_rate_ms: 2000,
        }
    }
}
