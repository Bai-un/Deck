export interface NetworkTweak {
  id: string
  name: string
  description: string
  category: string
  current_value: string
  is_optimized: boolean
  requires_restart: boolean
  risk_level: string
}

export interface NetworkTweakResult {
  tweak_id: string
  success: boolean
  new_value: string
  message: string
  needs_restart: boolean
}

export interface PowerPlan {
  guid: string
  name: string
  is_active: boolean
  is_builtin: boolean
  description: string
}

export interface StartupItem {
  id: string
  name: string
  publisher: string
  command: string
  source: string
  enabled: boolean
  impact: string
}

export interface PeripheralTweak {
  id: string
  name: string
  description: string
  category: string
  current_value: string
  is_optimized: boolean
  available_options: string[]
}
