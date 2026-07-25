use sysinfo::Disks;

use crate::models::hardware::{DiskInfo, DiskSensorData};

/// 前一次采样的磁盘 IO 数据，用于计算读写速度
pub struct DiskPrevSnapshot {
    pub timestamp: std::time::Instant,
    pub read_bytes: Vec<u64>,
    pub write_bytes: Vec<u64>,
}

/// 获取磁盘静态信息
pub fn get_disk_info(disks: &Disks) -> Vec<DiskInfo> {
    disks
        .iter()
        .map(|d| {
            let name = d.name().to_string_lossy().to_string();
            let mount_point = d.mount_point().to_string_lossy().to_string();
            let total = d.total_space();
            let kind = match d.kind() {
                sysinfo::DiskKind::SSD => "SSD",
                sysinfo::DiskKind::HDD => "HDD",
                _ => "Unknown",
            };

            DiskInfo {
                name,
                mount_point,
                filesystem: String::new(),
                total_bytes: total,
                is_removable: d.is_removable(),
                disk_type: kind.to_string(),
            }
        })
        .collect()
}

/// 创建前一次磁盘 IO 快照
pub fn create_disk_prev(disks: &Disks) -> DiskPrevSnapshot {
    DiskPrevSnapshot {
        timestamp: std::time::Instant::now(),
        read_bytes: disks.iter().map(|d| d.usage().read_bytes).collect(),
        write_bytes: disks.iter().map(|d| d.usage().written_bytes).collect(),
    }
}

/// 获取磁盘实时传感器数据（需要前一次采样数据计算速度）
pub fn get_disk_sensor(
    disks: &Disks,
    prev: &DiskPrevSnapshot,
    _now: &std::time::Instant,
    elapsed_secs: f64,
) -> Vec<DiskSensorData> {
    disks
        .iter()
        .enumerate()
        .map(|(i, d)| {
            let name = d.name().to_string_lossy().to_string();
            let total = d.total_space();
            let used = total.saturating_sub(d.available_space());
            let usage = if total > 0 {
                (used as f32 / total as f32) * 100.0
            } else {
                0.0
            };

            let disk_usage = d.usage();
            let read_bps = if i < prev.read_bytes.len() && elapsed_secs > 0.0 {
                ((disk_usage.read_bytes.saturating_sub(prev.read_bytes[i])) as f64
                    / elapsed_secs) as u64
            } else {
                0
            };

            let write_bps = if i < prev.write_bytes.len() && elapsed_secs > 0.0 {
                ((disk_usage.written_bytes.saturating_sub(prev.write_bytes[i])) as f64
                    / elapsed_secs) as u64
            } else {
                0
            };

            DiskSensorData {
                name,
                used_bytes: used,
                total_bytes: total,
                usage_percent: usage,
                read_bytes_per_sec: read_bps,
                write_bytes_per_sec: write_bps,
                temperature_c: None,
            }
        })
        .collect()
}
