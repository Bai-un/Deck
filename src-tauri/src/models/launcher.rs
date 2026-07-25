use serde::{Deserialize, Serialize};

/// 单个快捷启动项
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct LauncherItem {
    pub id: String,
    pub name: String,
    pub exe_path: String,
    pub icon_base64: String,
    pub added_at: u64,
    pub sort_order: u32,
}

/// 启动器配置（持久化到 JSON 文件）
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct LauncherConfig {
    pub items: Vec<LauncherItem>,
}
