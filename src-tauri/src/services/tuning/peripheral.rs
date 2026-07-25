use winreg::enums::*;
use winreg::RegKey;
use crate::models::tuning::PeripheralTweak;

fn get_mouse_accel_status() -> PeripheralTweak {
    let key = RegKey::predef(HKEY_CURRENT_USER)
        .open_subkey_with_flags(r"Control Panel\Mouse", KEY_READ);

    let mouse_speed = match &key {
        Ok(k) => k.get_value::<String, _>("MouseSpeed").unwrap_or_default(),
        Err(_) => String::new(),
    };
    let optimized = mouse_speed == "0";

    PeripheralTweak {
        id: "mouse_accel".into(),
        name: "关闭鼠标加速".into(),
        description: "关闭 Windows 鼠标加速，提高 FPS 游戏瞄准精度".into(),
        category: "mouse".into(),
        current_value: if optimized { "已关闭".into() } else { "已启用".into() },
        is_optimized: optimized,
        available_options: vec!["optimized".into(), "default".into()],
    }
}

fn get_mouse_speed_status() -> PeripheralTweak {
    let key = RegKey::predef(HKEY_CURRENT_USER)
        .open_subkey_with_flags(r"Control Panel\Mouse", KEY_READ);

    let sensitivity = match &key {
        Ok(k) => k.get_value::<String, _>("MouseSensitivity").unwrap_or_else(|_| "10".into()),
        Err(_) => "10".into(),
    };

    PeripheralTweak {
        id: "mouse_speed".into(),
        name: "鼠标灵敏度".into(),
        description: "调整鼠标移动速度 (1-20)".into(),
        category: "mouse".into(),
        current_value: sensitivity.clone(),
        is_optimized: false,
        available_options: (1..=20).map(|i| i.to_string()).collect(),
    }
}

fn get_keyboard_delay_status() -> PeripheralTweak {
    let key = RegKey::predef(HKEY_CURRENT_USER)
        .open_subkey_with_flags(r"Control Panel\Keyboard", KEY_READ);

    let delay = match &key {
        Ok(k) => k.get_value::<String, _>("KeyboardDelay").unwrap_or_else(|_| "1".into()),
        Err(_) => "1".into(),
    };

    PeripheralTweak {
        id: "keyboard_delay".into(),
        name: "键盘重复延迟".into(),
        description: "按住按键后开始重复的延迟时间 (0-3)".into(),
        category: "keyboard".into(),
        current_value: delay,
        is_optimized: false,
        available_options: vec!["0".into(), "1".into(), "2".into(), "3".into()],
    }
}

fn get_keyboard_speed_status() -> PeripheralTweak {
    let key = RegKey::predef(HKEY_CURRENT_USER)
        .open_subkey_with_flags(r"Control Panel\Keyboard", KEY_READ);

    let speed = match &key {
        Ok(k) => k.get_value::<String, _>("KeyboardSpeed").unwrap_or_else(|_| "31".into()),
        Err(_) => "31".into(),
    };

    PeripheralTweak {
        id: "keyboard_speed".into(),
        name: "键盘重复速率".into(),
        description: "按住按键后字符重复的速度 (0-31)".into(),
        category: "keyboard".into(),
        current_value: speed,
        is_optimized: false,
        available_options: (0..=31).map(|i| i.to_string()).collect(),
    }
}

fn get_usb_power_status() -> PeripheralTweak {
    // Check USB selective suspend setting via powercfg
    let output = std::process::Command::new("powercfg")
        .args(["/query", "2a737441-1930-4402-8d77-b2bebba308a3", "48e6b7a6-50f5-4782-a5d4-53bb8f07e226"])
        .output();

    let disabled = match &output {
        Ok(o) => {
            let stdout = String::from_utf8_lossy(&o.stdout);
            // Check current AC value for USB selective suspend
            stdout.contains("0x00000000")
        }
        Err(_) => false,
    };

    PeripheralTweak {
        id: "usb_power".into(),
        name: "USB 选择性挂起".into(),
        description: "禁用 USB 选择性挂起，防止 USB 设备因节能而断连".into(),
        category: "usb".into(),
        current_value: if disabled { "已禁用".into() } else { "已启用".into() },
        is_optimized: disabled,
        available_options: vec!["optimized".into(), "default".into()],
    }
}

/// 获取所有外设调优项
pub fn get_peripheral_tweaks() -> Vec<PeripheralTweak> {
    vec![
        get_mouse_accel_status(),
        get_mouse_speed_status(),
        get_keyboard_delay_status(),
        get_keyboard_speed_status(),
        get_usb_power_status(),
    ]
}

/// 应用外设调优
pub fn apply_peripheral_tweak(tweak_id: &str, value: &str) -> Result<(), String> {
    match tweak_id {
        "mouse_accel" => {
            let key = RegKey::predef(HKEY_CURRENT_USER)
                .open_subkey_with_flags(r"Control Panel\Mouse", KEY_WRITE)
                .map_err(|e| format!("无法打开注册表: {}", e))?;

            if value == "optimized" {
                key.set_value("MouseSpeed", &"0").map_err(|e| format!("设置失败: {}", e))?;
                key.set_value("MouseThreshold1", &"0").map_err(|e| format!("设置失败: {}", e))?;
                key.set_value("MouseThreshold2", &"0").map_err(|e| format!("设置失败: {}", e))?;
            } else {
                key.set_value("MouseSpeed", &"1").map_err(|e| format!("设置失败: {}", e))?;
                key.set_value("MouseThreshold1", &"6").map_err(|e| format!("设置失败: {}", e))?;
                key.set_value("MouseThreshold2", &"10").map_err(|e| format!("设置失败: {}", e))?;
            }
            Ok(())
        }
        "mouse_speed" => {
            let key = RegKey::predef(HKEY_CURRENT_USER)
                .open_subkey_with_flags(r"Control Panel\Mouse", KEY_WRITE)
                .map_err(|e| format!("无法打开注册表: {}", e))?;
            key.set_value("MouseSensitivity", &value).map_err(|e| format!("设置失败: {}", e))?;
            Ok(())
        }
        "keyboard_delay" => {
            let key = RegKey::predef(HKEY_CURRENT_USER)
                .open_subkey_with_flags(r"Control Panel\Keyboard", KEY_WRITE)
                .map_err(|e| format!("无法打开注册表: {}", e))?;
            key.set_value("KeyboardDelay", &value).map_err(|e| format!("设置失败: {}", e))?;
            Ok(())
        }
        "keyboard_speed" => {
            let key = RegKey::predef(HKEY_CURRENT_USER)
                .open_subkey_with_flags(r"Control Panel\Keyboard", KEY_WRITE)
                .map_err(|e| format!("无法打开注册表: {}", e))?;
            key.set_value("KeyboardSpeed", &value).map_err(|e| format!("设置失败: {}", e))?;
            Ok(())
        }
        "usb_power" => {
            let sub_guid = "2a737441-1930-4402-8d77-b2bebba308a3";
            let setting_guid = "48e6b7a6-50f5-4782-a5d4-53bb8f07e226";

            // Get active power scheme
            let output = std::process::Command::new("powercfg")
                .arg("/getactivescheme")
                .output()
                .map_err(|e| format!("获取当前方案失败: {}", e))?;

            let stdout = String::from_utf8_lossy(&output.stdout);
            let active_guid = stdout.lines().find_map(|l| {
                let s = l.find('{')?;
                let e = l.find('}')?;
                Some(l[s..=e].to_string())
            }).ok_or_else(|| "无法获取当前方案 GUID".to_string())?;

            let val = if value == "optimized" { "0" } else { "1" };

            std::process::Command::new("powercfg")
                .args(["/setacvalueindex", &active_guid, sub_guid, setting_guid, val])
                .output()
                .map_err(|e| format!("设置 USB 挂起失败: {}", e))?;

            // Apply immediately
            std::process::Command::new("powercfg")
                .args(["/setdcvalueindex", &active_guid, sub_guid, setting_guid, val])
                .output()
                .map_err(|e| format!("设置 USB 挂起(DC)失败: {}", e))?;

            Ok(())
        }
        _ => Err(format!("未知外设调优项: {}", tweak_id)),
    }
}

/// 恢复所有外设默认设置
pub fn reset_peripheral_tweaks() -> Result<(), String> {
    apply_peripheral_tweak("mouse_accel", "default")?;
    apply_peripheral_tweak("mouse_speed", "10")?;
    apply_peripheral_tweak("keyboard_delay", "1")?;
    apply_peripheral_tweak("keyboard_speed", "31")?;
    apply_peripheral_tweak("usb_power", "default")?;
    Ok(())
}
