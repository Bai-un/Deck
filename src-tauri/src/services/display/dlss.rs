use crate::models::display::DLSSPreset;

pub fn get_dlss_presets() -> Vec<DLSSPreset> {
    vec![
        DLSSPreset {
            id: "quality".to_string(),
            name: "质量".to_string(),
            description: "最佳画质，性能影响较小".to_string(),
            render_scale: 0.67,
            is_active: false,
        },
        DLSSPreset {
            id: "balanced".to_string(),
            name: "平衡".to_string(),
            description: "画质与性能平衡".to_string(),
            render_scale: 0.58,
            is_active: false,
        },
        DLSSPreset {
            id: "performance".to_string(),
            name: "性能".to_string(),
            description: "更高帧率，画质有所下降".to_string(),
            render_scale: 0.50,
            is_active: false,
        },
        DLSSPreset {
            id: "ultra_performance".to_string(),
            name: "超级性能".to_string(),
            description: "最高帧率，画质损失明显".to_string(),
            render_scale: 0.33,
            is_active: false,
        },
    ]
}

/// Check for NVIDIA GPU presence via registry
pub fn is_nvidia_available() -> bool {
    use winreg::enums::*;
    use winreg::RegKey;

    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let paths = [
        r"SOFTWARE\NVIDIA Corporation\Global",
        r"HARDWARE\DEVICEMAP\VIDEO",
    ];

    for path in &paths {
        if hklm.open_subkey_with_flags(path, KEY_READ).is_ok() {
            return true;
        }
    }
    false
}

/// Set DLSS preset via registry (NVIDIA)
pub fn set_dlss_preset(preset_id: &str) -> Result<(), String> {
    use winreg::enums::*;
    use winreg::RegKey;

    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);

    // Try common NVIDIA registry paths for DLSS
    let paths = [
        r"SOFTWARE\NVIDIA Corporation\Global\NvBackend",
        r"SYSTEM\CurrentControlSet\Services\nvlddmkm\Global\NvBackend",
    ];

    let mut written = false;
    for path in &paths {
        if let Ok(key) = hklm.open_subkey_with_flags(path, KEY_WRITE) {
            key.set_value("DLSSPreset", &preset_id).ok();
            written = true;
        }
    }

    if written {
        Ok(())
    } else {
        Err("无法写入 DLSS 注册表设置。请确认已安装 NVIDIA 驱动，或通过 NVIDIA Control Panel 手动设置。".to_string())
    }
}
