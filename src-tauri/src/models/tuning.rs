use serde::{Deserialize, Serialize};

// ========== 网络调优 ==========

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkTweak {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub current_value: String,
    pub is_optimized: bool,
    pub requires_restart: bool,
    pub risk_level: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkTweakResult {
    pub tweak_id: String,
    pub success: bool,
    pub new_value: String,
    pub message: String,
    pub needs_restart: bool,
}

// ========== 电源管理 ==========

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PowerPlan {
    pub guid: String,
    pub name: String,
    pub is_active: bool,
    pub is_builtin: bool,
    pub description: String,
}

// ========== 启动项管理 ==========

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StartupItem {
    pub id: String,
    pub name: String,
    pub publisher: String,
    pub command: String,
    pub source: String,
    pub enabled: bool,
    pub impact: String,
}

// ========== 外设优化 ==========

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PeripheralTweak {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub current_value: String,
    pub is_optimized: bool,
    pub available_options: Vec<String>,
}
