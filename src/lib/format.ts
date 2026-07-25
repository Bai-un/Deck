/** 字节格式化为可读字符串 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const idx = Math.min(i, units.length - 1)
  return `${(bytes / Math.pow(1024, idx)).toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`
}

/** 频率格式化 */
export function formatFrequency(mhz: number): string {
  if (mhz >= 1000) {
    return `${(mhz / 1000).toFixed(1)} GHz`
  }
  return `${Math.round(mhz)} MHz`
}

/** 速度格式化（每秒字节） */
export function formatSpeed(bytesPerSec: number): string {
  if (bytesPerSec === 0) return '0 B/s'
  const units = ['B/s', 'KB/s', 'MB/s', 'GB/s']
  const i = Math.floor(Math.log(bytesPerSec) / Math.log(1024))
  const idx = Math.min(i, units.length - 1)
  return `${(bytesPerSec / Math.pow(1024, idx)).toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`
}

/** 百分比保留一位小数 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}
