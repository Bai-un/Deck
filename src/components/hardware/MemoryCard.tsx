import { Flex, Box, Text, Progress } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { UsageLineChart } from './UsageLineChart'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { formatBytes, formatPercent } from '../../lib/format'
import type { MemorySensorData } from '../../types/hardware'

interface MemoryCardProps {
  data: MemorySensorData | null
  history: number[]
  totalMemoryBytes: number
}

export function MemoryCard({ data, history, totalMemoryBytes }: MemoryCardProps) {
  const { t } = useTranslation()
  const accentColor = useSettingsStore((s) => s.accentColor)

  const usage = data?.usage_percent ?? 0
  const used = data?.used_bytes ?? 0
  const total = data?.total_bytes ?? totalMemoryBytes
  const swapUsed = data?.swap_used_bytes ?? 0
  const swapTotal = data?.swap_total_bytes ?? 0

  const barColor = usage > 80 ? '#FF5555' : usage > 50 ? '#FFA500' : accentColor

  return (
    <Flex
      bg="#161B22"
      border="1px solid"
      borderColor="#30363D"
      borderRadius="12px"
      p={5}
      direction="column"
      gap={3}
    >
      <Text fontSize="xs" color="#8B949E" textTransform="uppercase" fontWeight={600}>
        {t('hardware.memory')}
      </Text>

      <Flex align="center" gap={4}>
        <Flex direction="column" flex={1} gap={1}>
          <Flex justify="space-between" align="center">
            <Text fontSize="sm" color="#E6EDF3" fontWeight={600}>
              {formatPercent(usage)}
            </Text>
            <Text fontSize="xs" color="#8B949E">
              {formatBytes(used)} / {formatBytes(total)}
            </Text>
          </Flex>
          <Progress
            value={usage}
            size="md"
            borderRadius="4px"
            colorScheme={usage > 80 ? 'red' : usage > 50 ? 'orange' : 'brand'}
            sx={{
              '& > div': {
                backgroundColor: barColor,
              },
            }}
            bg="#21262D"
          />
        </Flex>

        <Box w="120px" h="60px">
          <UsageLineChart data={history} color={accentColor} />
        </Box>
      </Flex>

      {swapTotal > 0 && (
        <Flex gap={2} align="center" opacity={0.6}>
          <Text fontSize="xs" color="#8B949E">
            Swap: {formatBytes(swapUsed)} / {formatBytes(swapTotal)}
          </Text>
        </Flex>
      )}
    </Flex>
  )
}
