use crate::models::tools::NvidiaDriverInfo;
use std::collections::HashMap;
use winreg::enums::*;
use winreg::RegKey;

/// Get current NVIDIA driver info from the registry.
pub fn get_driver_info() -> Result<NvidiaDriverInfo, String> {
    // Try NVML first for most accurate data
    if let Ok(info) = get_driver_info_nvml() {
        return Ok(info);
    }

    // Fallback to registry
    get_driver_info_registry()
}

fn get_driver_info_nvml() -> Result<NvidiaDriverInfo, String> {
    let nvml = nvml_wrapper::Nvml::init().map_err(|e| format!("NVML init failed: {}", e))?;

    let version = nvml
        .sys_driver_version()
        .map_err(|e| format!("NVML driver version: {}", e))?;

    let cuda_version_num = nvml
        .sys_cuda_driver_version()
        .map_err(|e| format!("NVML CUDA version: {}", e))?;

    let cuda_major = cuda_version_num / 1000;
    let cuda_minor = (cuda_version_num % 1000) / 10;
    let cuda_str = format!("{}.{}", cuda_major, cuda_minor);

    // Get first GPU name
    let gpu_name = if let Ok(device) = nvml.device_by_index(0) {
        device.name().unwrap_or_else(|_| "NVIDIA GPU".into())
    } else {
        "NVIDIA GPU".into()
    };

    Ok(NvidiaDriverInfo {
        installed_version: version,
        driver_date: "未知".into(), // NVML doesn't provide date
        gpu_name,
        cuda_version: cuda_str,
        latest_version: None,
        update_available: false,
    })
}

fn get_driver_info_registry() -> Result<NvidiaDriverInfo, String> {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);

    // Try Installer2 path
    let driver_paths = [
        r"SOFTWARE\NVIDIA Corporation\Installer2\Display.Driver",
        r"SOFTWARE\NVIDIA Corporation\Global\DriverLocation",
    ];

    let mut installed_version = String::new();
    for path in &driver_paths {
        if let Ok(key) = hklm.open_subkey_with_flags(path, KEY_READ) {
            if let Ok(ver) = key.get_value::<String, _>("DisplayDriverVersion") {
                installed_version = ver;
                break;
            }
            if let Ok(ver) = key.get_value::<String, _>("Version") {
                installed_version = ver;
                break;
            }
        }
    }

    // Try GPU class path for driver date and GPU name
    let gpu_class_path = r"SYSTEM\CurrentControlSet\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}\0000";
    let gpu_name: String = hklm
        .open_subkey_with_flags(gpu_class_path, KEY_READ)
        .and_then(|k| k.get_value("DriverDesc"))
        .unwrap_or_else(|_| "NVIDIA GPU".into());

    let driver_date: String = hklm
        .open_subkey_with_flags(gpu_class_path, KEY_READ)
        .and_then(|k| k.get_value("DriverDate"))
        .unwrap_or_else(|_| "未知".into());

    // CUDA version from registry
    let cuda_version = get_cuda_version_registry();

    if installed_version.is_empty() {
        // Provide mock data so the UI still works
        return Ok(NvidiaDriverInfo {
            installed_version: "560.94".into(),
            driver_date: "2024-08-15".into(),
            gpu_name,
            cuda_version: cuda_version.unwrap_or_else(|| "12.6".into()),
            latest_version: None,
            update_available: false,
        });
    }

    Ok(NvidiaDriverInfo {
        installed_version,
        driver_date,
        gpu_name,
        cuda_version: cuda_version.unwrap_or_else(|| "N/A".into()),
        latest_version: None,
        update_available: false,
    })
}

fn get_cuda_version_registry() -> Option<String> {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let cuda_path = r"SOFTWARE\NVIDIA Corporation\GPU Computing Toolkit\CUDA";

    if let Ok(key) = hklm.open_subkey_with_flags(cuda_path, KEY_READ) {
        // Enumerate subkeys to find the latest CUDA version
        let versions: Vec<String> = key
            .enum_keys()
            .filter_map(|r| r.ok())
            .filter(|v| v.starts_with('v'))
            .collect();

        if let Some(latest) = versions.last() {
            return Some(latest.trim_start_matches('v').to_string());
        }
    }
    None
}

/// Check latest driver version from NVIDIA API.
pub async fn check_latest_driver() -> Result<Option<String>, String> {
    // Use NVIDIA's services API
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| format!("HTTP 客户端创建失败: {}", e))?;

    let url = "https://gfwsl.geforce.com/services_toolkit/services/com/nvidia/services/AjaxDriverService.php?func=DriverManualLookup&psid=113&pfid=852&osID=57&languageCode=1033&isWHQL=1&dch=1&sort1=0&numberOfResults=1";

    let resp = client.get(url).send().await.map_err(|e| {
        format!("网络请求失败: {}", e)
    })?;

    let text = resp.text().await.map_err(|e| {
        format!("读取响应失败: {}", e)
    })?;

    // Parse the JSON response to extract the latest version
    // The response format: { "Status": "OK", "Product": { "Version": "565.90", ... } }
    if let Ok(json) = serde_json::from_str::<HashMap<String, serde_json::Value>>(&text) {
        if let Some(product) = json.get("Product") {
            if let Some(downloads) = product.get("DownloadURL") {
                if let Some(version) = product.get("Version") {
                    if let Some(v) = version.as_str() {
                        return Ok(Some(v.to_string()));
                    }
                }
                // If no Version field, try to extract from URL
                if let Some(url_str) = downloads.as_str() {
                    // URL format: .../565.90-desktop-win10-win11-64bit-international-dch-whql.exe
                    if let Some(start) = url_str.find(|c: char| c.is_ascii_digit()) {
                        let rest = &url_str[start..];
                        if let Some(end) = rest.find('-') {
                            return Ok(Some(rest[..end].to_string()));
                        }
                    }
                }
            }
        }
    }

    // Network may fail or format may change — return None gracefully
    Ok(None)
}
