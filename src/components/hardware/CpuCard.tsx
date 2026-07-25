import { Flex, Box, Text, CircularProgress, CircularProgressLabel } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { UsageLineChart } from './UsageLineChart'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { formatPercent, formatFrequency } from '../../lib/format'
import type { CpuSensorData } from '../../types/hardware'

interface CpuCardProps {
  data: CpuSensorData | null
  history: number[]
  brand: string
  coreCount: number
  threadCount: number
}

export function CpuCard({ data, history, brand, coreCount, threadCount }: CpuCardProps) {
  const { t } = useTranslation()
  const accentColor = useSettingsStore((s) => s.accentColor)

  const usage = data?.usage_percent ?? 0
  const ringColor = usage > 80 ? '#FF5555' : usage > 50 ? '#FFA500' : accentColor

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
        {t('hardware.cpu')}
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
          {brand}
        </Text>
        <Text fontSize="xs" color="#8B949E">
          {coreCount}C/{threadCount}T
        </Text>
        {data && (
          <>
            <Text fontSize="xs" color="#8B949E">
              {formatFrequency(data.frequency_mhz)}
            </Text>
            {data.temperature_c !== null && (
              <Text fontSize="xs" color="#8B949E">
                {data.temperature_c.toFixed(0)}°C
              </Text>
            )}
          </>
        )}
      </Flex>
    </Flex>
  )
}
