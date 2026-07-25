use std::process::Command;

/// 启动指定路径的程序
pub fn launch_app(exe_path: &str) -> Result<(), String> {
    let path = std::path::Path::new(exe_path);
    if !path.exists() {
        return Err(format!("程序不存在: {}", exe_path));
    }

    Command::new(exe_path)
        .spawn()
        .map_err(|e| format!("启动失败: {}", e))?;

    Ok(())
}

/// 在资源管理器中打开并选中文件
pub fn open_file_location(exe_path: &str) -> Result<(), String> {
    let path = std::path::Path::new(exe_path);
    if !path.exists() {
        return Err(format!("程序不存在: {}", exe_path));
    }

    Command::new("explorer")
        .arg("/select,")
        .arg(exe_path)
        .spawn()
        .map_err(|e| format!("打开文件位置失败: {}", e))?;

    Ok(())
}
