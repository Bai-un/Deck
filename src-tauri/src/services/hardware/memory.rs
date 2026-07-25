use sysinfo::System;

use crate::models::hardware::MemorySensorData;

/// 获取内存实时传感器数据
pub fn get_memory_sensor(sys: &System) -> MemorySensorData {
    let total = sys.total_memory();
    let used = sys.used_memory();
    let usage = if total > 0 {
        (used as f32 / total as f32) * 100.0
    } else {
        0.0
    };

    MemorySensorData {
        used_bytes: used,
        total_bytes: total,
        usage_percent: usage,
        available_bytes: total.saturating_sub(used),
        swap_used_bytes: sys.used_swap(),
        swap_total_bytes: sys.total_swap(),
    }
}
