use crate::models::cleanup::MemoryCleanupResult;
use std::time::Duration;
use sysinfo::{ProcessesToUpdate, System};
use windows_sys::Win32::Foundation::CloseHandle;
use windows_sys::Win32::System::Memory::SetProcessWorkingSetSizeEx;
use windows_sys::Win32::System::Threading::{OpenProcess, PROCESS_SET_QUOTA};

/// 执行内存清理：
/// 遍历所有进程，调用 SetProcessWorkingSetSizeEx 裁剪工作集，
/// 迫使系统将不活跃页面换出到 pagefile，从而释放物理内存。
pub fn cleanup_memory() -> Result<MemoryCleanupResult, String> {
    let mut sys = System::new_all();
    sys.refresh_memory();
    let before = sys.used_memory();
    let total = sys.total_memory();

    // 遍历所有进程，裁剪工作集
    sys.refresh_processes(ProcessesToUpdate::All, true);

    for (pid, _process) in sys.processes() {
        unsafe {
            let handle = OpenProcess(PROCESS_SET_QUOTA, 0, pid.as_u32());
            if !handle.is_null() {
                SetProcessWorkingSetSizeEx(handle, usize::MAX, usize::MAX, 0);
                CloseHandle(handle);
            }
        }
    }

    // 等待系统完成换页
    std::thread::sleep(Duration::from_millis(500));

    // 重新读取内存
    sys.refresh_memory();
    let after = sys.used_memory();

    Ok(MemoryCleanupResult {
        freed_bytes: before.saturating_sub(after),
        before_used_bytes: before,
        after_used_bytes: after,
        total_bytes: total,
    })
}
