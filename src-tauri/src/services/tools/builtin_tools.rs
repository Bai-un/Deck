use crate::models::tools::BuiltinTool;
use std::process::Command;

/// Get the list of built-in Windows system tools.
pub fn get_builtin_tools() -> Vec<BuiltinTool> {
    vec![
        // System tools
        BuiltinTool {
            id: "task_manager".into(),
            name: "任务管理器".into(),
            description: "查看和管理正在运行的进程、性能、应用历史等".into(),
            category: "system".into(),
            command: "taskmgr".into(),
            icon: "Activity".into(),
            requires_admin: false,
        },
        BuiltinTool {
            id: "device_manager".into(),
            name: "设备管理器".into(),
            description: "查看和更新设备驱动程序、硬件配置".into(),
            category: "system".into(),
            command: "devmgmt.msc".into(),
            icon: "Monitor".into(),
            requires_admin: true,
        },
        BuiltinTool {
            id: "services".into(),
            name: "服务".into(),
            description: "管理系统后台服务".into(),
            category: "system".into(),
            command: "services.msc".into(),
            icon: "Settings".into(),
            requires_admin: false,
        },
        BuiltinTool {
            id: "regedit".into(),
            name: "注册表编辑器".into(),
            description: "查看和修改 Windows 注册表".into(),
            category: "system".into(),
            command: "regedit".into(),
            icon: "FileCode".into(),
            requires_admin: false,
        },
        BuiltinTool {
            id: "cmd".into(),
            name: "命令提示符".into(),
            description: "Windows 命令行解释器".into(),
            category: "system".into(),
            command: "cmd".into(),
            icon: "Terminal".into(),
            requires_admin: false,
        },
        BuiltinTool {
            id: "powershell".into(),
            name: "PowerShell".into(),
            description: "高级命令行 Shell 和脚本语言".into(),
            category: "system".into(),
            command: "powershell".into(),
            icon: "TerminalSquare".into(),
            requires_admin: false,
        },
        // System info tools
        BuiltinTool {
            id: "msinfo32".into(),
            name: "系统信息".into(),
            description: "查看完整的系统硬件和软件信息".into(),
            category: "systemInfo".into(),
            command: "msinfo32".into(),
            icon: "Info".into(),
            requires_admin: false,
        },
        BuiltinTool {
            id: "dxdiag".into(),
            name: "DirectX 诊断工具".into(),
            description: "诊断 DirectX 声音和视频问题".into(),
            category: "systemInfo".into(),
            command: "dxdiag".into(),
            icon: "Gamepad2".into(),
            requires_admin: false,
        },
        BuiltinTool {
            id: "resmon".into(),
            name: "资源监视器".into(),
            description: "实时查看 CPU、内存、磁盘、网络资源使用".into(),
            category: "systemInfo".into(),
            command: "resmon".into(),
            icon: "BarChart3".into(),
            requires_admin: false,
        },
        BuiltinTool {
            id: "perfmon".into(),
            name: "性能监视器".into(),
            description: "收集和分析性能数据".into(),
            category: "systemInfo".into(),
            command: "perfmon".into(),
            icon: "TrendingUp".into(),
            requires_admin: false,
        },
        // Network tools
        BuiltinTool {
            id: "ncpa".into(),
            name: "网络连接".into(),
            description: "管理网络适配器设置".into(),
            category: "network".into(),
            command: "ncpa.cpl".into(),
            icon: "Wifi".into(),
            requires_admin: false,
        },
        BuiltinTool {
            id: "firewall".into(),
            name: "Windows 防火墙".into(),
            description: "配置防火墙规则和安全设置".into(),
            category: "network".into(),
            command: "firewall.cpl".into(),
            icon: "Shield".into(),
            requires_admin: true,
        },
        // Disk tools
        BuiltinTool {
            id: "diskmgmt".into(),
            name: "磁盘管理".into(),
            description: "管理磁盘分区和卷".into(),
            category: "disk".into(),
            command: "diskmgmt.msc".into(),
            icon: "HardDrive".into(),
            requires_admin: true,
        },
        BuiltinTool {
            id: "cleanmgr".into(),
            name: "磁盘清理".into(),
            description: "清理磁盘上的临时文件和不必要文件".into(),
            category: "disk".into(),
            command: "cleanmgr".into(),
            icon: "Trash2".into(),
            requires_admin: false,
        },
        BuiltinTool {
            id: "dfrgui".into(),
            name: "磁盘碎片整理".into(),
            description: "分析和优化磁盘驱动器".into(),
            category: "disk".into(),
            command: "dfrgui".into(),
            icon: "Zap".into(),
            requires_admin: false,
        },
        // Security tools
        BuiltinTool {
            id: "eventvwr".into(),
            name: "事件查看器".into(),
            description: "查看系统日志、应用程序日志和安全日志".into(),
            category: "security".into(),
            command: "eventvwr.msc".into(),
            icon: "ScrollText".into(),
            requires_admin: false,
        },
        BuiltinTool {
            id: "secpol".into(),
            name: "本地安全策略".into(),
            description: "配置本地安全策略和权限".into(),
            category: "security".into(),
            command: "secpol.msc".into(),
            icon: "Lock".into(),
            requires_admin: true,
        },
        // Other
        BuiltinTool {
            id: "control".into(),
            name: "控制面板".into(),
            description: "访问系统设置和配置选项".into(),
            category: "system".into(),
            command: "control".into(),
            icon: "Sliders".into(),
            requires_admin: false,
        },
        BuiltinTool {
            id: "appwiz".into(),
            name: "程序和功能".into(),
            description: "卸载、更改或修复已安装的程序".into(),
            category: "system".into(),
            command: "appwiz.cpl".into(),
            icon: "Package".into(),
            requires_admin: false,
        },
    ]
}

/// Launch a built-in system tool by its command.
pub fn launch_tool(command: &str) -> Result<(), String> {
    let result = if command.ends_with(".msc") {
        Command::new("mmc").arg(command).spawn()
    } else if command.ends_with(".cpl") {
        Command::new("rundll32")
            .args(["shell32.dll,Control_RunDLL", command])
            .spawn()
    } else {
        Command::new(command).spawn()
    };

    match result {
        Ok(_child) => {
            // Detach process — child handle is dropped, process continues running
            std::mem::forget(_child);
            Ok(())
        }
        Err(e) => Err(format!("启动失败: {}", e)),
    }
}
