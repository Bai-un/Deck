use std::ffi::OsStr;
use std::os::windows::ffi::OsStrExt;
use std::path::Path;
use windows_sys::Win32::UI::Shell::ShellExecuteW;
use windows_sys::Win32::UI::WindowsAndMessaging::SW_SHOWNORMAL;

/// 启动指定路径的程序
pub fn launch_app(exe_path: &str) -> Result<(), String> {
    let path = Path::new(exe_path);

    if !path.exists() {
        return Err(format!("程序不存在: {}", exe_path));
    }

    let working_dir = path.parent().unwrap_or(Path::new("."));
    log::info!("启动程序: {} (工作目录: {:?})", exe_path, working_dir);

    let ext = path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    match ext.as_str() {
        "exe" => {
            match std::process::Command::new(exe_path)
                .current_dir(working_dir)
                .spawn()
            {
                Ok(_) => {
                    log::info!("程序已启动: {}", exe_path);
                    Ok(())
                }
                Err(e) => {
                    log::warn!("直接启动失败 ({}), 尝试 ShellExecute: {}", e, exe_path);
                    launch_with_shell_execute(exe_path)
                }
            }
        }
        _ => {
            launch_with_shell_execute(exe_path)
        }
    }
}

/// 使用 Windows ShellExecuteW 启动（支持 UAC 提升和快捷方式）
fn launch_with_shell_execute(exe_path: &str) -> Result<(), String> {
    let wide_path: Vec<u16> = OsStrExt::encode_wide(OsStr::new(exe_path))
        .chain(std::iter::once(0))
        .collect();
    let wide_open: Vec<u16> = "open\0".encode_utf16().collect();

    unsafe {
        let result = ShellExecuteW(
            std::ptr::null_mut(),
            wide_open.as_ptr(),
            wide_path.as_ptr(),
            std::ptr::null(),
            std::ptr::null(),
            SW_SHOWNORMAL as i32,
        );

        // ShellExecuteW returns a value > 32 on success
        if result as isize > 32 {
            log::info!("ShellExecute 启动成功: {}", exe_path);
            Ok(())
        } else {
            let err_msg = format!("ShellExecute 失败, 错误码: {}", result as isize);
            log::error!("{}: {}", err_msg, exe_path);
            Err(err_msg)
        }
    }
}

/// 在资源管理器中打开并选中文件
pub fn open_file_location(exe_path: &str) -> Result<(), String> {
    let path = Path::new(exe_path);
    if !path.exists() {
        return Err(format!("程序不存在: {}", exe_path));
    }

    std::process::Command::new("explorer")
        .arg("/select,")
        .arg(exe_path)
        .spawn()
        .map_err(|e| {
            log::error!("打开文件位置失败 [{}]: {}", exe_path, e);
            format!("打开文件位置失败: {}", e)
        })?;

    Ok(())
}
