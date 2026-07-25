import { Flex, Text, Progress, VStack, Box } from '@chakra-ui/react'
import { useHardwareInfo } from '../hooks/useHardwareInfo'
import { useSensorData } from '../hooks/useSensorData'
import { useHardwareStore } from '../stores/useHardwareStore'
import { formatBytes, formatSpeed, formatFrequency, formatPercent } from '../lib/format'

export function OverlayPage() {
  useHardwareInfo()
  useSensorData(2000) // Overlay refreshes slower

  const snapshot = useHardwareStore((s) => s.currentSnapshot)
  const systemInfo = useHardwareStore((s) => s.systemInfo)

  const cpu = snapshot?.cpu ?? null
  const gpu = snapshot && snapshot.gpus.length > 0 ? snapshot.gpus[0] : null
  const mem = snapshot?.memory ?? null
  const disk = snapshot?.disks[0] ?? null
  const diskInfo = systemInfo?.disks[0]

  return (
    <Box
      h="100vh"
      p={3}
      bg="rgba(13,17,23,0.85)"
      sx={{ backdropFilter: 'blur(10px)' }}
      borderRadius="12px"
      fontFamily="system-ui, sans-serif"
      data-tauri-drag-region
      cursor="grab"
      overflow="auto"
    >
      {/* Header */}
      <Text fontSize="11px" color="#6C63FF" fontWeight={700} textTransform="uppercase" mb={3} letterSpacing="1px">
        Deck Monitor
      </Text>

      <VStack gap={3} align="stretch">
        {/* CPU */}
        <Section label="CPU">
          {cpu && (
            <>
              <Bar value={cpu.usage_percent} color={cpu.usage_percent > 80 ? '#FF5555' : '#6C63FF'} />
              <Flex justify="space-between">
                <Text fontSize="11px" color="#8B949E">
                  {formatFrequency(cpu.frequency_mhz)}
                </Text>
                <Text fontSize="11px" color="#8B949E">
                  {cpu.temperature_c !== null ? `${cpu.temperature_c.toFixed(0)}°C` : ''}
                </Text>
              </Flex>
            </>
          )}
        </Section>

        {/* GPU */}
        {gpu && (
          <Section label="GPU">
            <Bar value={gpu.usage_percent} color={gpu.usage_percent > 80 ? '#FF5555' : '#A66CFF'} />
            <Flex justify="space-between">
              <Text fontSize="11px" color="#8B949E">
                {gpu.clock_core_mhz ? `${gpu.clock_core_mhz} MHz` : ''}
              </Text>
              <Text fontSize="11px" color="#8B949E">
                {gpu.temperature_c !== null ? `${gpu.temperature_c.toFixed(0)}°C` : ''}
              </Text>
            </Flex>
            <Text fontSize="11px" color="#8B949E">
              VRAM: {formatBytes(gpu.vram_used_mb * 1024 * 1024)} / {formatBytes(gpu.vram_total_mb * 1024 * 1024)}
            </Text>
          </Section>
        )}

        {/* RAM */}
        <Section label="RAM">
          {mem && (
            <>
              <Bar value={mem.usage_percent} color={mem.usage_percent > 80 ? '#FF5555' : '#4ECDC4'} />
              <Text fontSize="11px" color="#8B949E">
                {formatBytes(mem.used_bytes)} / {formatBytes(mem.total_bytes)}
              </Text>
            </>
          )}
        </Section>

        {/* Disk */}
        {disk && (
          <Section label={`Disk ${diskInfo?.mount_point ?? ''}`}>
            <Bar value={disk.usage_percent} color={disk.usage_percent > 90 ? '#FF5555' : '#FFD93D'} />
            <Flex justify="space-between">
              <Text fontSize="11px" color="#8B949E">
                R: {formatSpeed(disk.read_bytes_per_sec)}
              </Text>
              <Text fontSize="11px" color="#8B949E">
                W: {formatSpeed(disk.write_bytes_per_sec)}
              </Text>
            </Flex>
          </Section>
        )}
      </VStack>
    </Box>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Text fontSize="11px" color="#E6EDF3" fontWeight={600} mb={1}>
        {label}
      </Text>
      <VStack gap={0.5} align="stretch">
        {children}
      </VStack>
    </Box>
  )
}

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <Flex align="center" gap={2}>
      <Box flex={1}>
        <Progress
          value={value}
          size="sm"
          borderRadius="3px"
          sx={{ '& > div': { backgroundColor: color } }}
          bg="#21262D"
        />
      </Box>
      <Text fontSize="11px" color="#E6EDF3" fontWeight={600} w="40px" textAlign="right">
        {formatPercent(value)}
      </Text>
    </Flex>
  )
}
