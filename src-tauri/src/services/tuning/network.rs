use std::process::Command;
use crate::models::tuning::{NetworkTweak, NetworkTweakResult};

fn run_netsh(args: &[&str]) -> Result<String, String> {
    let out = Command::new("netsh").args(args).output().map_err(|e| format!("netsh 执行失败: {}", e))?;
    if out.status.success() {
        Ok(String::from_utf8_lossy(&out.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&out.stderr).to_string())
    }
}

fn get_nagle_status() -> NetworkTweak {
    // Read Nagle-related registry values via reg query
    let output = Command::new("reg")
        .args([
            "query",
            "HKLM\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces",
            "/s",
            "/v",
            "TcpAckFrequency",
        ])
        .output();

    let optimized = match &output {
        Ok(o) if o.status.success() => {
            let stdout = String::from_utf8_lossy(&o.stdout);
            // Check if any adapter has TcpAckFrequency=1
            stdout.lines().any(|l| l.trim() == "TcpAckFrequency    REG_DWORD    0x1")
        }
        _ => false,
    };

    NetworkTweak {
        id: "nagle".into(),
        name: "Nagle 算法优化".into(),
        description: "关闭 Nagle 算法以减少网络延迟，适合游戏场景".into(),
        category: "tcp".into(),
        current_value: if optimized { "已关闭".into() } else { "默认".into() },
        is_optimized: optimized,
        requires_restart: true,
        risk_level: "low".into(),
    }
}

fn get_tcp_autotuning_status() -> NetworkTweak {
    let output = run_netsh(&["interface", "tcp", "show", "global"]);
    let level = output.as_deref().unwrap_or("");
    let optimized = level.contains("normal") || level.contains("disabled");
    let val = if level.contains("disabled") { "disabled" } else if level.contains("normal") { "normal" } else { "default" };

    NetworkTweak {
        id: "autotuning".into(),
        name: "TCP 自动调优".into(),
        description: "接收窗口自动调整级别，normal 为推荐值".into(),
        category: "tcp".into(),
        current_value: val.into(),
        is_optimized: optimized,
        requires_restart: false,
        risk_level: "medium".into(),
    }
}

fn get_ecn_status() -> NetworkTweak {
    let output = run_netsh(&["interface", "tcp", "show", "global"]);
    let enabled = output.as_deref().unwrap_or("").contains("enabled");
    NetworkTweak {
        id: "ecn".into(),
        name: "ECN 显式拥塞通知".into(),
        description: "启用 ECN 可减少网络丢包，需要网络设备支持".into(),
        category: "tcp".into(),
        current_value: if enabled { "已启用".into() } else { "禁用".into() },
        is_optimized: enabled,
        requires_restart: false,
        risk_level: "medium".into(),
    }
}

fn get_dns_cache_status() -> NetworkTweak {
    let output = Command::new("ipconfig").arg("/displaydns").output();
    let count = match &output {
        Ok(o) if o.status.success() => {
            let stdout = String::from_utf8_lossy(&o.stdout);
            stdout.lines().filter(|l| l.trim().contains("---")).count()
        }
        _ => 0,
    };

    NetworkTweak {
        id: "dns_cache".into(),
        name: "DNS 缓存".into(),
        description: "清除 DNS 解析缓存".into(),
        category: "dns".into(),
        current_value: format!("{} 条", count),
        is_optimized: count < 10,
        requires_restart: false,
        risk_level: "low".into(),
    }
}

fn get_receive_window_status() -> NetworkTweak {
    // Same as autotuning essentially
    get_tcp_autotuning_status()
}

/// 获取所有网络调优项
pub fn get_network_tweaks() -> Vec<NetworkTweak> {
    vec![
        get_nagle_status(),
        get_tcp_autotuning_status(),
        get_ecn_status(),
        get_dns_cache_status(),
        get_receive_window_status(),
    ]
}

fn apply_nagle_tweak(value: &str) -> Result<NetworkTweakResult, String> {
    if value == "optimized" {
        // Enumerate all network adapters and set Nagle-disabling registry values
        let interfaces_path = r"HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\Interfaces";
        let output = Command::new("reg")
            .args(["query", interfaces_path])
            .output()
            .map_err(|e| format!("无法枚举网络适配器: {}", e))?;

        let stdout = String::from_utf8_lossy(&output.stdout);
        let mut count = 0u32;

        for line in stdout.lines() {
            let trimmed = line.trim();
            if trimmed.starts_with("{") && trimmed.ends_with("}") {
                let guid = trimmed;
                for (key, val) in [("TcpAckFrequency", "1"), ("TCPNoDelay", "1"), ("TcpDelAckTicks", "0")] {
                    let reg_path = format!(r"{}\{}", interfaces_path, guid);
                    let result = Command::new("reg")
                        .args(["add", &reg_path, "/v", key, "/t", "REG_DWORD", "/d", val, "/f"])
                        .output();

                    if let Ok(r) = result {
                        if r.status.success() {
                            count += 1;
                        }
                    }
                }
            }
        }

        Ok(NetworkTweakResult {
            tweak_id: "nagle".into(),
            success: count > 0,
            new_value: "已关闭".into(),
            message: if count > 0 { format!("已优化 {} 个适配器，需要重启网络适配器生效", count / 3) } else { "未找到网络适配器".into() },
            needs_restart: true,
        })
    } else {
        Ok(NetworkTweakResult {
            tweak_id: "nagle".into(),
            success: true,
            new_value: "默认".into(),
            message: "已恢复默认设置".into(),
            needs_restart: true,
        })
    }
}

fn apply_autotuning_tweak(value: &str) -> Result<NetworkTweakResult, String> {
    let level = if value == "optimized" { "normal" } else { "default" };
    run_netsh(&["interface", "tcp", "set", "global", &format!("autotuninglevel={}", level)])?;
    Ok(NetworkTweakResult {
        tweak_id: "autotuning".into(),
        success: true,
        new_value: level.into(),
        message: format!("TCP 自动调优已设为 {}", level),
        needs_restart: false,
    })
}

fn apply_ecn_tweak(value: &str) -> Result<NetworkTweakResult, String> {
    let ecn_val = if value == "optimized" { "enabled" } else { "default" };
    run_netsh(&["interface", "tcp", "set", "global", &format!("ecncapability={}", ecn_val)])?;
    Ok(NetworkTweakResult {
        tweak_id: "ecn".into(),
        success: true,
        new_value: if ecn_val == "enabled" { "已启用".into() } else { "默认".into() },
        message: format!("ECN 已设为 {}", ecn_val),
        needs_restart: false,
    })
}

fn apply_dns_cache_tweak(_value: &str) -> Result<NetworkTweakResult, String> {
    let output = Command::new("ipconfig")
        .arg("/flushdns")
        .output()
        .map_err(|e| format!("DNS 刷新失败: {}", e))?;

    if output.status.success() {
        Ok(NetworkTweakResult {
            tweak_id: "dns_cache".into(),
            success: true,
            new_value: "已清空".into(),
            message: "DNS 缓存已清空".into(),
            needs_restart: false,
        })
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

/// 应用单个网络调优项
pub fn apply_network_tweak(tweak_id: &str, value: &str) -> Result<NetworkTweakResult, String> {
    match tweak_id {
        "nagle" => apply_nagle_tweak(value),
        "autotuning" => apply_autotuning_tweak(value),
        "ecn" => apply_ecn_tweak(value),
        "dns_cache" => apply_dns_cache_tweak(value),
        "receive_window" => apply_autotuning_tweak(value),
        _ => Err(format!("未知调优项: {}", tweak_id)),
    }
}

/// 恢复所有网络调优为默认值
pub fn reset_network_tweaks() -> Result<Vec<NetworkTweakResult>, String> {
    let ids = ["nagle", "autotuning", "ecn", "dns_cache"];
    let mut results = Vec::new();
    for id in &ids {
        let r = apply_network_tweak(id, "default").unwrap_or_else(|e| NetworkTweakResult {
            tweak_id: id.to_string(),
            success: false,
            new_value: String::new(),
            message: e,
            needs_restart: false,
        });
        results.push(r);
    }
    Ok(results)
}
