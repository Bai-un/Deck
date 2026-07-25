use std::process::Command;
use crate::models::tuning::PowerPlan;

fn parse_powercfg_list(output: &str) -> Vec<PowerPlan> {
    let mut plans = Vec::new();
    for line in output.lines() {
        let trimmed = line.trim();
        if !trimmed.starts_with("电源方案") && !trimmed.starts_with("Power Scheme") {
            // Also try to match raw GUID pattern
            if !trimmed.contains('{') && !trimmed.contains('}') {
                continue;
            }
        }

        // Extract GUID: {xxxx-xxxx-...}
        let guid_start = trimmed.find('{');
        let guid_end = trimmed.find('}');
        let guid = match (guid_start, guid_end) {
            (Some(s), Some(e)) => trimmed[s..=e].to_string(),
            _ => continue,
        };

        let is_active = trimmed.ends_with('*') || trimmed.contains(" *");
        // Extract name: after GUID, before *
        let name_part = if let Some(idx) = trimmed.rfind('}') {
            let after = &trimmed[idx + 1..];
            after.trim().trim_end_matches('*').trim().to_string()
        } else {
            String::new()
        };

        let is_builtin = match name_part.as_str() {
            "平衡" | "高性能" | "节能" | "Balanced" | "High performance" | "Power saver" => true,
            _ => !name_part.starts_with("Deck"),
        };

        let description = match name_part.as_str() {
            "平衡" | "Balanced" => "自动平衡性能与功耗".into(),
            "高性能" | "High performance" => "最大限度提升性能".into(),
            "节能" | "Power saver" => "降低功耗以延长电池续航".into(),
            _ => String::new(),
        };

        if !name_part.is_empty() {
            plans.push(PowerPlan {
                guid,
                name: name_part,
                is_active,
                is_builtin,
                description,
            });
        }
    }
    plans
}

/// 获取所有电源方案
pub fn get_power_plans() -> Vec<PowerPlan> {
    let output = Command::new("powercfg").arg("/list").output();
    match output {
        Ok(o) if o.status.success() => {
            let stdout = String::from_utf8_lossy(&o.stdout);
            parse_powercfg_list(&stdout)
        }
        _ => vec![],
    }
}

/// 激活指定电源方案
pub fn activate_power_plan(guid: &str) -> Result<(), String> {
    let output = Command::new("powercfg")
        .args(["/setactive", guid])
        .output()
        .map_err(|e| format!("powercfg 执行失败: {}", e))?;

    if output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

/// 创建 Deck 高性能电源方案
pub fn create_deck_power_plan() -> Result<PowerPlan, String> {
    // Find high performance GUID
    let plans = get_power_plans();
    let hp_guid = plans.iter().find(|p| p.name == "高性能" || p.name == "High performance").map(|p| p.guid.clone())
        .ok_or_else(|| "未找到高性能电源方案".to_string())?;

    // Duplicate high performance scheme
    let dup_output = Command::new("powercfg")
        .args(["/duplicatescheme", &hp_guid])
        .output()
        .map_err(|e| format!("复制方案失败: {}", e))?;

    if !dup_output.status.success() {
        return Err(String::from_utf8_lossy(&dup_output.stderr).to_string());
    }

    let stdout = String::from_utf8_lossy(&dup_output.stdout);
    // Extract new GUID from output: "电源方案 GUID: {xxxx-...}  (Deck 极致性能)"
    let new_guid = stdout.lines().find_map(|l| {
        let s = l.find('{')?;
        let e = l.find('}')?;
        Some(l[s..=e].to_string())
    }).ok_or_else(|| "无法获取新方案 GUID".to_string())?;

    // Rename
    Command::new("powercfg")
        .args(["/changename", &new_guid, "Deck 极致性能", "CPU 100% / USB 不挂起 / 硬盘不休眠"])
        .output()
        .map_err(|e| format!("重命名失败: {}", e))?;

    // Optimize sub-settings
    let sub_guid = "54533251-82be-4824-96c1-47b60b740d00"; // processor sub-group

    // CPU min state 100%
    let _ = Command::new("powercfg")
        .args(["/setacvalueindex", &new_guid, sub_guid, "893dee8e-2bef-41e0-89c6-b55d0929964c", "100"])
        .output();

    // CPU max state 100%
    let _ = Command::new("powercfg")
        .args(["/setacvalueindex", &new_guid, sub_guid, "bc5038f7-23e0-4960-96da-33abaf5935ec", "100"])
        .output();

    // USB selective suspend - disable
    let _ = Command::new("powercfg")
        .args(["/setacvalueindex", &new_guid, "2a737441-1930-4402-8d77-b2bebba308a3", "48e6b7a6-50f5-4782-a5d4-53bb8f07e226", "0"])
        .output();

    // Hard disk timeout - 0 (never)
    let _ = Command::new("powercfg")
        .args(["/setacvalueindex", &new_guid, "0012ee47-9041-4b5d-9b77-535fba8b1442", "6738e2c4-e8a5-4a42-b16a-e040e769756e", "0"])
        .output();

    // PCI Express ASPM - off
    let _ = Command::new("powercfg")
        .args(["/setacvalueindex", &new_guid, "ee12f906-d277-404b-b6da-e5fa1a576df5", "12bb0f84-c6a2-4b2f-aa6b-31ecffd4b7b3", "0"])
        .output();

    // Activate the new plan
    activate_power_plan(&new_guid)?;

    Ok(PowerPlan {
        guid: new_guid,
        name: "Deck 极致性能".into(),
        is_active: true,
        is_builtin: false,
        description: "CPU 100% / USB 不挂起 / 硬盘不休眠".into(),
    })
}

/// 删除自定义电源方案
pub fn delete_power_plan(guid: &str) -> Result<(), String> {
    let output = Command::new("powercfg")
        .args(["/delete", guid])
        .output()
        .map_err(|e| format!("删除失败: {}", e))?;

    if output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}
