use std::sync::Arc;
use std::thread;
use std::time::{Duration, Instant};

use parking_lot::Mutex;
use sysinfo::{Disks, System};
use tauri::{AppHandle, Emitter};

use crate::models::hardware::SensorSnapshot;

use super::cpu;
use super::disk;
use super::gpu::GpuMonitor;
use super::memory;

pub struct HardwareMonitor {
    sys: Arc<Mutex<System>>,
    gpu_monitor: Arc<GpuMonitor>,
    running: Arc<Mutex<bool>>,
}

impl HardwareMonitor {
    pub fn new() -> Self {
        let mut sys = System::new();
        sys.refresh_cpu_all();
        sys.refresh_memory();

        Self {
            sys: Arc::new(Mutex::new(sys)),
            gpu_monitor: Arc::new(GpuMonitor::new()),
            running: Arc::new(Mutex::new(false)),
        }
    }

    /// 采集一次完整快照
    pub fn collect_snapshot(&self) -> SensorSnapshot {
        let mut sys = self.sys.lock();
        sys.refresh_cpu_all();
        sys.refresh_memory();

        let disks = Disks::new_with_refreshed_list();

        let cpu_sensor = cpu::get_cpu_sensor(&sys);
        let memory_sensor = memory::get_memory_sensor(&sys);
        let gpu_sensors = self.gpu_monitor.get_gpu_sensor();

        let prev = disk::create_disk_prev(&disks);
        let now = Instant::now();
        let disk_sensors = disk::get_disk_sensor(&disks, &prev, &now, 0.0);

        SensorSnapshot {
            timestamp: chrono::Utc::now().timestamp_millis() as u64,
            cpu: cpu_sensor,
            gpus: gpu_sensors,
            memory: memory_sensor,
            disks: disk_sensors,
        }
    }

    /// 获取系统静态硬件信息
    pub fn get_static_info(&self) -> crate::models::hardware::SystemInfo {
        let mut sys = self.sys.lock();
        sys.refresh_cpu_all();
        sys.refresh_memory();

        let cpu_info = cpu::get_cpu_info(&sys);
        let gpu_info = self.gpu_monitor.get_gpu_info();
        let disks = Disks::new_with_refreshed_list();
        let disk_info = disk::get_disk_info(&disks);

        crate::models::hardware::SystemInfo {
            os_name: std::env::consts::OS.to_string(),
            os_version: std::env::consts::OS.to_string(),
            hostname: System::host_name().unwrap_or_default(),
            cpu: cpu_info,
            gpus: gpu_info,
            total_memory_bytes: sys.total_memory(),
            disks: disk_info,
        }
    }

    /// 启动后台监控循环
    pub fn start(&self, app: AppHandle, interval_ms: u64) {
        *self.running.lock() = true;

        let sys = self.sys.clone();
        let gpu_monitor = self.gpu_monitor.clone();
        let running_flag = self.running.clone();

        let initial_disks = Disks::new_with_refreshed_list();
        let mut prev_disk = disk::create_disk_prev(&initial_disks);

        thread::spawn(move || {
            while *running_flag.lock() {
                {
                    let mut sys = sys.lock();
                    sys.refresh_cpu_usage();
                    sys.refresh_memory();
                }

                let disks = Disks::new_with_refreshed_list();
                let now = Instant::now();
                let elapsed = now.duration_since(prev_disk.timestamp).as_secs_f64();

                let cpu_sensor = {
                    let sys = sys.lock();
                    cpu::get_cpu_sensor(&sys)
                };
                let memory_sensor = {
                    let sys = sys.lock();
                    memory::get_memory_sensor(&sys)
                };
                let gpu_sensors = gpu_monitor.get_gpu_sensor();
                let disk_sensors = disk::get_disk_sensor(&disks, &prev_disk, &now, elapsed);

                prev_disk = disk::DiskPrevSnapshot {
                    timestamp: now,
                    read_bytes: disks.iter().map(|d| d.usage().read_bytes).collect(),
                    write_bytes: disks.iter().map(|d| d.usage().written_bytes).collect(),
                };

                let snapshot = SensorSnapshot {
                    timestamp: chrono::Utc::now().timestamp_millis() as u64,
                    cpu: cpu_sensor,
                    gpus: gpu_sensors,
                    memory: memory_sensor,
                    disks: disk_sensors,
                };

                let _ = app.emit("hardware:sensor-update", &snapshot);
                thread::sleep(Duration::from_millis(interval_ms));
            }
        });
    }

    /// 停止后台监控
    pub fn stop(&self) {
        *self.running.lock() = false;
    }

    /// 监控是否运行中
    pub fn is_running(&self) -> bool {
        *self.running.lock()
    }
}
