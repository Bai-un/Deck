use nvml_wrapper::Nvml;

use crate::models::hardware::{GpuInfo, GpuSensorData};

pub struct GpuMonitor {
    nvml: Option<Nvml>,
}

impl GpuMonitor {
    pub fn new() -> Self {
        let nvml = match Nvml::init() {
            Ok(n) => {
                log::info!("NVML initialized successfully");
                Some(n)
            }
            Err(e) => {
                log::warn!("NVML init failed (non-NVIDIA GPU or driver issue): {}", e);
                None
            }
        };
        Self { nvml }
    }

    /// 获取 GPU 静态信息列表
    pub fn get_gpu_info(&self) -> Vec<GpuInfo> {
        let nvml = match &self.nvml {
            Some(n) => n,
            None => return Vec::new(),
        };

        let device_count = match nvml.device_count() {
            Ok(c) => c,
            Err(_) => return Vec::new(),
        };

        let mut gpus = Vec::with_capacity(device_count as usize);
        for i in 0..device_count {
            let device = match nvml.device_by_index(i) {
                Ok(d) => d,
                Err(_) => continue,
            };

            let name = device.name().unwrap_or_default();
            let mem = match device.memory_info() {
                Ok(m) => m,
                Err(_) => {
                    nvml_wrapper::struct_wrappers::device::MemoryInfo {
                        total: 0,
                        free: 0,
                        used: 0,
                    }
                }
            };
            let driver_ver = nvml.sys_driver_version().unwrap_or_default();

            gpus.push(GpuInfo {
                name: name.trim().to_string(),
                vendor: "NVIDIA".to_string(),
                vram_total_mb: mem.total / (1024 * 1024),
                driver_version: driver_ver.trim().to_string(),
                is_nvidia: true,
            });
        }

        gpus
    }

    /// 获取 GPU 实时传感器数据
    pub fn get_gpu_sensor(&self) -> Vec<GpuSensorData> {
        let nvml = match &self.nvml {
            Some(n) => n,
            None => return Vec::new(),
        };

        let device_count = match nvml.device_count() {
            Ok(c) => c,
            Err(_) => return Vec::new(),
        };

        let mut sensors = Vec::with_capacity(device_count as usize);
        for i in 0..device_count {
            let device = match nvml.device_by_index(i) {
                Ok(d) => d,
                Err(_) => continue,
            };

            let name = device.name().unwrap_or_default();
            let utilization = device.utilization_rates().ok();
            let temperature = device
                .temperature(nvml_wrapper::enum_wrappers::device::TemperatureSensor::Gpu)
                .ok();
            let mem = device.memory_info().ok();
            let fan_speed = device.fan_speed(0).ok();
            let power = device.power_usage().ok();
            let clock_core = device
                .clock_info(nvml_wrapper::enum_wrappers::device::Clock::Graphics)
                .ok();
            let clock_mem = device
                .clock_info(nvml_wrapper::enum_wrappers::device::Clock::Memory)
                .ok();

            sensors.push(GpuSensorData {
                name: name.trim().to_string(),
                usage_percent: utilization.map(|u| u.gpu as f32).unwrap_or(0.0),
                temperature_c: temperature.map(|t| t as f32),
                vram_used_mb: mem.as_ref().map(|m| m.used / (1024 * 1024)).unwrap_or(0),
                vram_total_mb: mem.as_ref().map(|m| m.total / (1024 * 1024)).unwrap_or(0),
                fan_speed_percent: fan_speed.map(|s| s as f32),
                power_watts: power.map(|p| p as f32 / 1000.0),
                clock_core_mhz: clock_core,
                clock_memory_mhz: clock_mem,
            });
        }

        sensors
    }
}
