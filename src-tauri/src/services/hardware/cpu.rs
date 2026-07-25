use sysinfo::System;

use crate::models::hardware::CpuInfo;

/// 获取 CPU 静态信息
pub fn get_cpu_info(sys: &System) -> CpuInfo {
    let cpu = sys.cpus().first();
    CpuInfo {
        brand: cpu.map(|c| c.brand().to_string()).unwrap_or_default(),
        vendor: cpu.map(|c| c.vendor_id().to_string()).unwrap_or_default(),
        core_count: sys.physical_core_count().unwrap_or(0),
        thread_count: sys.cpus().len(),
        base_frequency_mhz: cpu.map(|c| c.frequency()).unwrap_or(0),
    }
}

use crate::models::hardware::CpuSensorData;

/// 获取 CPU 实时传感器数据
/// sysinfo 需要至少两次刷新间隔才能计算准确的使用率
pub fn get_cpu_sensor(sys: &System) -> CpuSensorData {
    let usage = sys.global_cpu_usage();
    let per_core: Vec<f32> = sys.cpus().iter().map(|c| c.cpu_usage()).collect();
    let freq = sys
        .cpus()
        .first()
        .map(|c| c.frequency() as f64)
        .unwrap_or(0.0);

    CpuSensorData {
        usage_percent: usage,
        temperature_c: None,
        frequency_mhz: freq,
        per_core_usage: per_core,
        power_watts: None,
    }
}
