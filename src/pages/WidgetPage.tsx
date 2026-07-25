import { Flex, Text } from '@chakra-ui/react'
import { useHardwareInfo } from '../hooks/useHardwareInfo'
import { useSensorData } from '../hooks/useSensorData'
import { useHardwareStore } from '../stores/useHardwareStore'
import { formatBytes, formatPercent } from '../lib/format'

export function WidgetPage() {
  useHardwareInfo()
  useSensorData(2000) // Widget refreshes slower

  const snapshot = useHardwareStore((s) => s.currentSnapshot)
  const systemInfo = useHardwareStore((s) => s.systemInfo)

  const cpu = snapshot?.cpu.usage_percent ?? null
  const gpu = snapshot && snapshot.gpus.length > 0 ? snapshot.gpus[0].usage_percent : null
  const mem = snapshot?.memory ?? null

  return (
    <Flex
      h="100vh"
      align="center"
      justify="center"
      px={3}
      gap={4}
      bg="rgba(13,17,23,0.85)"
      sx={{ backdropFilter: 'blur(10px)' }}
      borderRadius="8px"
      fontFamily="system-ui, sans-serif"
      data-tauri-drag-region
      cursor="grab"
    >
      <Flex gap={1.5} align="baseline">
        <Text fontSize="xs" color="#8B949E" fontWeight={600}>
          CPU
        </Text>
        <Text fontSize="13px" color={cpu !== null && cpu > 80 ? '#FF5555' : '#6C63FF'} fontWeight={700}>
          {cpu !== null ? formatPercent(cpu) : '—'}
        </Text>
      </Flex>

      {gpu !== null && (
        <Flex gap={1.5} align="baseline">
          <Text fontSize="xs" color="#8B949E" fontWeight={600}>
            GPU
          </Text>
          <Text fontSize="13px" color={gpu > 80 ? '#FF5555' : '#A66CFF'} fontWeight={700}>
            {formatPercent(gpu)}
          </Text>
        </Flex>
      )}

      <Flex gap={1.5} align="baseline">
        <Text fontSize="xs" color="#8B949E" fontWeight={600}>
          RAM
        </Text>
        <Text fontSize="13px" color={mem && mem.usage_percent > 80 ? '#FF5555' : '#4ECDC4'} fontWeight={700}>
          {mem ? `${formatPercent(mem.usage_percent)}` : '—'}
        </Text>
        {mem && systemInfo && (
          <Text fontSize="11px" color="#8B949E">
            {formatBytes(mem.used_bytes)}
          </Text>
        )}
      </Flex>
    </Flex>
  )
}
