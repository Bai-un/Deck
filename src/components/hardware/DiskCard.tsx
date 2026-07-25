import { Flex, Text, Progress, VStack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { formatBytes, formatSpeed, formatPercent } from '../../lib/format'
import type { DiskSensorData, DiskInfo } from '../../types/hardware'

interface DiskCardProps {
  disks: DiskSensorData[]
  diskInfo: DiskInfo[]
}

export function DiskCard({ disks, diskInfo }: DiskCardProps) {
  const { t } = useTranslation()

  if (disks.length === 0) {
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
          {t('hardware.disk')}
        </Text>
        <Text fontSize="sm" color="#8B949E">
          {t('common.loading')}
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
      gap={4}
    >
      <Text fontSize="xs" color="#8B949E" textTransform="uppercase" fontWeight={600}>
        {t('hardware.disk')}
      </Text>

      <VStack gap={3} align="stretch">
        {disks.map((disk, i) => {
          const info = diskInfo[i]
          const label = info?.mount_point || disk.name
          const total = disk.total_bytes
          const used = disk.used_bytes
          const pct = disk.usage_percent
          const barColor = pct > 90 ? '#FF5555' : pct > 70 ? '#FFA500' : '#6C63FF'

          return (
            <Flex key={disk.name} direction="column" gap={1}>
              <Flex justify="space-between" align="center" mb={1}>
                <Flex gap={2} align="center">
                  <Text fontSize="sm" color="#E6EDF3" fontWeight={600}>
                    {label}
                  </Text>
                  {info?.disk_type && (
                    <Text fontSize="xs" color="#8B949E">
                      {info.disk_type}
                    </Text>
                  )}
                </Flex>
                <Text fontSize="xs" color="#8B949E">
                  {formatPercent(pct)}
                </Text>
              </Flex>
              <Progress
                value={pct}
                size="sm"
                borderRadius="4px"
                sx={{ '& > div': { backgroundColor: barColor } }}
                bg="#21262D"
              />
              <Flex justify="space-between" mt={1}>
                <Text fontSize="xs" color="#8B949E">
                  {formatBytes(used)} / {formatBytes(total)}
                </Text>
                <Flex gap={3}>
                  <Text fontSize="xs" color="#8B949E">
                    R: {formatSpeed(disk.read_bytes_per_sec)}
                  </Text>
                  <Text fontSize="xs" color="#8B949E">
                    W: {formatSpeed(disk.write_bytes_per_sec)}
                  </Text>
                  {disk.temperature_c !== null && (
                    <Text fontSize="xs" color="#8B949E">
                      {disk.temperature_c.toFixed(0)}°C
                    </Text>
                  )}
                </Flex>
              </Flex>
            </Flex>
          )
        })}
      </VStack>
    </Flex>
  )
}
