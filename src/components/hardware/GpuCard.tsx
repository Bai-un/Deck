import { Flex, Box, Text, CircularProgress, CircularProgressLabel } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { UsageLineChart } from './UsageLineChart'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { formatPercent } from '../../lib/format'
import type { GpuSensorData, GpuInfo } from '../../types/hardware'

interface GpuCardProps {
  data: GpuSensorData | null
  history: number[]
  info: GpuInfo | null
}

export function GpuCard({ data, history, info }: GpuCardProps) {
  const { t } = useTranslation()
  const accentColor = useSettingsStore((s) => s.accentColor)

  const usage = data?.usage_percent ?? 0
  const ringColor = usage > 80 ? '#FF5555' : usage > 50 ? '#FFA500' : accentColor

  if (!info) {
    return (
      <Flex
        bg="#161B22"
        border="1px solid"
        borderColor="#30363D"
        borderRadius="12px"
        p={5}
        direction="column"
        gap={3}
        flex={1}
        minW={0}
        align="center"
        justify="center"
      >
        <Text fontSize="xs" color="#8B949E">
          {t('hardware.monitorUnavailable')}
        </Text>
      </Flex>
    )
  }

  return (
    <Flex
      bg="#161B22"
      border="1px solid"
      borderColor="#30363D"
      borderRadius="12px"
      p={5}
      direction="column"
      gap={3}
      flex={1}
      minW={0}
    >
      <Text fontSize="xs" color="#8B949E" textTransform="uppercase" fontWeight={600}>
        {t('hardware.gpu')}
      </Text>

      <Flex align="center" gap={5}>
        <CircularProgress
          value={usage}
          size="90px"
          thickness="6px"
          color={ringColor}
          trackColor="#21262D"
        >
          <CircularProgressLabel fontSize="lg" fontWeight="bold" color="#E6EDF3">
            {formatPercent(usage)}
          </CircularProgressLabel>
        </CircularProgress>

        <Box flex={1} minW={0}>
          <UsageLineChart data={history} color={accentColor} />
        </Box>
      </Flex>

      <Flex gap={4} flexWrap="wrap">
        <Text fontSize="xs" color="#8B949E">
          {info.name}
        </Text>
        {data && (
          <>
            <Text fontSize="xs" color="#8B949E">
              VRAM: {(data.vram_used_mb / 1024).toFixed(1)}/{data.vram_total_mb > 0
                ? (data.vram_total_mb / 1024).toFixed(1)
                : '?'} GB
            </Text>
            {data.temperature_c !== null && (
              <Text fontSize="xs" color="#8B949E">
                {data.temperature_c.toFixed(0)}°C
              </Text>
            )}
            {data.fan_speed_percent !== null && (
              <Text fontSize="xs" color="#8B949E">
                {t('hardware.fanSpeed')}: {data.fan_speed_percent.toFixed(0)}%
              </Text>
            )}
          </>
        )}
      </Flex>
    </Flex>
  )
}
