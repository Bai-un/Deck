#[cfg(windows)]
pub fn extract_icon(exe_path: &str) -> String {
    use std::ffi::OsStr;
    use std::iter::once;
    use std::os::windows::ffi::OsStrExt;
    use windows_sys::Win32::UI::Shell::ExtractIconExW;
    use windows_sys::Win32::UI::WindowsAndMessaging::DestroyIcon;

    let wide: Vec<u16> = OsStr::new(exe_path)
        .encode_wide()
        .chain(once(0))
        .collect();

    unsafe {
        let mut hicon_large = std::ptr::null_mut();
        let mut hicon_small = std::ptr::null_mut();

        let count = ExtractIconExW(wide.as_ptr(), 0, &mut hicon_large, &mut hicon_small, 1);

        if count <= 0 || hicon_large.is_null() {
            let _ = hicon_small;
            return create_default_icon();
        }

        let result = icon_to_png_base64(hicon_large);

        if !hicon_large.is_null() {
            DestroyIcon(hicon_large);
        }
        if !hicon_small.is_null() {
            DestroyIcon(hicon_small);
        }

        result
    }
}

#[cfg(windows)]
unsafe fn icon_to_png_base64(icon: *mut core::ffi::c_void) -> String {
    use base64::Engine;
    use image::RgbaImage;
    use windows_sys::Win32::Graphics::Gdi::{
        CreateCompatibleDC, DeleteDC, DeleteObject, GetDIBits, GetObjectW, BITMAP,
        BITMAPINFOHEADER, BI_RGB, DIB_RGB_COLORS,
    };
    use windows_sys::Win32::UI::WindowsAndMessaging::{GetIconInfo, ICONINFO};

    let mut icon_info: ICONINFO = std::mem::zeroed();
    if GetIconInfo(icon, &mut icon_info) == 0 {
        return create_default_icon();
    }

    let hbm_color = icon_info.hbmColor;
    if hbm_color.is_null() {
        if !icon_info.hbmMask.is_null() {
            DeleteObject(icon_info.hbmMask);
        }
        return create_default_icon();
    }

    let mut bitmap: BITMAP = std::mem::zeroed();
    if GetObjectW(
        hbm_color as _,
        std::mem::size_of::<BITMAP>() as i32,
        &mut bitmap as *mut _ as *mut _,
    ) == 0
    {
        DeleteObject(hbm_color);
        if !icon_info.hbmMask.is_null() {
            DeleteObject(icon_info.hbmMask);
        }
        return create_default_icon();
    }

    let width = bitmap.bmWidth as u32;
    let height = bitmap.bmHeight as u32;

    let hdc = CreateCompatibleDC(std::ptr::null_mut());
    if hdc.is_null() {
        DeleteObject(hbm_color);
        if !icon_info.hbmMask.is_null() {
            DeleteObject(icon_info.hbmMask);
        }
        return create_default_icon();
    }

    // Set up BITMAPINFOHEADER for 32-bit BGRA
    let mut bmi_header: BITMAPINFOHEADER = std::mem::zeroed();
    bmi_header.biSize = std::mem::size_of::<BITMAPINFOHEADER>() as u32;
    bmi_header.biWidth = width as i32;
    bmi_header.biHeight = -(height as i32); // top-down
    bmi_header.biPlanes = 1;
    bmi_header.biBitCount = 32;
    bmi_header.biCompression = BI_RGB;

    let row_size = width as usize * 4;
    let pixel_count = row_size * height as usize;
    let mut pixels = vec![0u8; pixel_count];

    let ret = GetDIBits(
        hdc,
        hbm_color,
        0,
        height,
        pixels.as_mut_ptr() as *mut _,
        &bmi_header as *const _ as *mut _,
        DIB_RGB_COLORS,
    );

    let result = if ret != 0 {
        // Convert BGRA -> RGBA
        for chunk in pixels.chunks_mut(4) {
            chunk.swap(0, 2);
        }

        let img = RgbaImage::from_raw(width, height, pixels).unwrap_or_else(|| {
            RgbaImage::from_pixel(64, 64, image::Rgba([100, 100, 100, 255]))
        });

        let mut buf = std::io::Cursor::new(Vec::new());
        if img.write_to(&mut buf, image::ImageFormat::Png).is_ok() {
            base64::engine::general_purpose::STANDARD.encode(buf.into_inner())
        } else {
            create_default_icon()
        }
    } else {
        create_default_icon()
    };

    // Cleanup GDI resources
    DeleteDC(hdc);
    DeleteObject(hbm_color);
    if !icon_info.hbmMask.is_null() {
        DeleteObject(icon_info.hbmMask);
    }

    result
}

#[cfg(not(windows))]
pub fn extract_icon(_exe_path: &str) -> String {
    create_default_icon()
}

/// 创建默认灰色图标（64×64 PNG base64）
fn create_default_icon() -> String {
    use base64::Engine;
    let img = image::RgbaImage::from_pixel(64, 64, image::Rgba([100, 100, 100, 255]));
    let mut buf = std::io::Cursor::new(Vec::new());
    if img
        .write_to(&mut buf, image::ImageFormat::Png)
        .is_ok()
    {
        base64::engine::general_purpose::STANDARD.encode(buf.into_inner())
    } else {
        String::new()
    }
}
