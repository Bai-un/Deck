use crate::models::display::{DisplayInfo, ResolutionPreset};

pub fn get_display_info() -> Result<DisplayInfo, String> {
    // Use winapi to get current display settings
    let info = unsafe {
        let mut devmode: windows_sys::Win32::Graphics::Gdi::DEVMODEW =
            std::mem::zeroed();
        devmode.dmSize = std::mem::size_of::<windows_sys::Win32::Graphics::Gdi::DEVMODEW>() as u16;

        if windows_sys::Win32::Graphics::Gdi::EnumDisplaySettingsW(
            std::ptr::null(),
            windows_sys::Win32::Graphics::Gdi::ENUM_CURRENT_SETTINGS,
            &mut devmode,
        ) == 0
        {
            return Err("无法获取显示器信息".to_string());
        }

        DisplayInfo {
            name: "主显示器".to_string(),
            native_width: devmode.dmPelsWidth,
            native_height: devmode.dmPelsHeight,
            current_width: devmode.dmPelsWidth,
            current_height: devmode.dmPelsHeight,
            current_refresh_rate: devmode.dmDisplayFrequency as u32,
            available_rates: Vec::new(),
            scale_factor: 1.0,
        }
    };

    Ok(info)
}

pub fn get_available_resolutions() -> Vec<ResolutionPreset> {
    let mut presets = Vec::new();
    let common_resolutions: [(u32, u32, &str); 8] = [
        (3840, 2160, "16:9"),
        (2560, 1440, "16:9"),
        (1920, 1080, "16:9"),
        (1680, 1050, "16:10"),
        (1600, 900, "16:9"),
        (1440, 900, "16:10"),
        (1366, 768, "16:9"),
        (1280, 720, "16:9"),
    ];

    // Enumerate all display modes
    let mut i = 0;
    unsafe {
        let mut devmode: windows_sys::Win32::Graphics::Gdi::DEVMODEW =
            std::mem::zeroed();
        devmode.dmSize = std::mem::size_of::<windows_sys::Win32::Graphics::Gdi::DEVMODEW>() as u16;

        let mut supported: Vec<(u32, u32, u32)> = Vec::new();

        while windows_sys::Win32::Graphics::Gdi::EnumDisplaySettingsW(
            std::ptr::null(),
            i,
            &mut devmode,
        ) != 0
        {
            supported.push((devmode.dmPelsWidth, devmode.dmPelsHeight, devmode.dmDisplayFrequency as u32));
            i += 1;
        }

        // Match common resolutions against supported modes
        for (w, h, ratio) in &common_resolutions {
            let matching_rates: Vec<u32> = supported
                .iter()
                .filter(|(sw, sh, _)| sw == w && sh == h)
                .map(|(_, _, r)| *r)
                .collect();

            if !matching_rates.is_empty() {
                let max_rate = *matching_rates.iter().max().unwrap_or(&60);
                presets.push(ResolutionPreset {
                    id: format!("{}x{}", w, h),
                    name: format!("{}x{}", w, h),
                    width: *w,
                    height: *h,
                    refresh_rate: max_rate,
                    aspect_ratio: ratio.to_string(),
                    is_current: matching_rates
                        .iter()
                        .any(|&r| r == max_rate),
                    is_native: false,
                });
            }
        }
    }

    presets
}

pub fn set_resolution(width: u32, height: u32, refresh_rate: u32) -> Result<(), String> {
    unsafe {
        let mut devmode: windows_sys::Win32::Graphics::Gdi::DEVMODEW =
            std::mem::zeroed();
        devmode.dmSize = std::mem::size_of::<windows_sys::Win32::Graphics::Gdi::DEVMODEW>() as u16;
        devmode.dmPelsWidth = width;
        devmode.dmPelsHeight = height;
        devmode.dmDisplayFrequency = refresh_rate as u32;
        devmode.dmFields = windows_sys::Win32::Graphics::Gdi::DM_PELSWIDTH
            | windows_sys::Win32::Graphics::Gdi::DM_PELSHEIGHT
            | windows_sys::Win32::Graphics::Gdi::DM_DISPLAYFREQUENCY;

        let result = windows_sys::Win32::Graphics::Gdi::ChangeDisplaySettingsW(
            &devmode,
            windows_sys::Win32::Graphics::Gdi::CDS_FULLSCREEN,
        );

        if result == windows_sys::Win32::Graphics::Gdi::DISP_CHANGE_SUCCESSFUL {
            Ok(())
        } else {
            Err(format!("更改分辨率失败 (错误码: {})", result))
        }
    }
}

pub fn calculate_custom_resolution(
    native_width: u32,
    native_height: u32,
    target_ratio: &str,
    scale_percent: u32,
) -> (u32, u32) {
    let scale = (scale_percent as f32 / 100.0).clamp(0.5, 1.0);
    let (ratio_w, ratio_h) = parse_aspect_ratio(target_ratio);

    if ratio_w == 0 || ratio_h == 0 {
        // Custom ratio - just scale
        let w = (native_width as f32 * scale) as u32;
        let h = (native_height as f32 * scale) as u32;
        return (w, h);
    }

    // Calculate based on target ratio and native height
    let target_w = (native_height as f32 * ratio_w as f32 / ratio_h as f32 * scale) as u32;
    let target_h = (native_height as f32 * scale) as u32;

    // Ensure even dimensions (required by many display modes)
    let w = (target_w / 2) * 2;
    let h = (target_h / 2) * 2;

    (w.max(640), h.max(480))
}

pub fn reset_to_native() -> Result<(), String> {
    unsafe {
        let result = windows_sys::Win32::Graphics::Gdi::ChangeDisplaySettingsW(
            std::ptr::null(),
            0,
        );

        if result == windows_sys::Win32::Graphics::Gdi::DISP_CHANGE_SUCCESSFUL {
            Ok(())
        } else {
            Err("恢复原生分辨率失败".to_string())
        }
    }
}

fn parse_aspect_ratio(ratio: &str) -> (u32, u32) {
    let parts: Vec<&str> = ratio.split(':').collect();
    if parts.len() == 2 {
        let w = parts[0].parse::<u32>().unwrap_or(0);
        let h = parts[1].parse::<u32>().unwrap_or(0);
        (w, h)
    } else {
        (0, 0)
    }
}
