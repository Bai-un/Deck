import { Flex, Text, Divider } from '@chakra-ui/react'

interface CleanupResultCardProps {
  freedBytes: number
  beforeBytes: number
  afterBytes: number
  label?: string
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const idx = Math.min(i, units.length - 1)
  return `${(bytes / Math.pow(1024, idx)).toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`
}

export function CleanupResultCard({
  freedBytes,
  beforeBytes,
  afterBytes,
  label,
}: CleanupResultCardProps) {
  return (
    <Flex
      direction="column"
      bg="#161B22"
      border="1px solid"
      borderColor="#30363D"
      borderRadius="12px"
      p={5}
      gap={3}
      w="full"
    >
      {label && (
        <Text fontSize="xs" color="#8B949E" textTransform="uppercase" fontWeight={600} letterSpacing="1px">
          {label}
        </Text>
      )}
      <Text fontSize="2xl" fontWeight={700} color="#4ECDC4">
        {formatBytes(freedBytes)}
      </Text>
      <Text fontSize="sm" color="#E6EDF3">
        {formatBytes(beforeBytes)} → {formatBytes(afterBytes)}
      </Text>
      <Divider borderColor="#30363D" />
      <Flex justify="space-between">
        <Text fontSize="xs" color="#8B949E">
          清理前
        </Text>
        <Text fontSize="xs" color="#E6EDF3" fontWeight={600}>
          {formatBytes(beforeBytes)}
        </Text>
      </Flex>
      <Flex justify="space-between">
        <Text fontSize="xs" color="#8B949E">
          清理后
        </Text>
        <Text fontSize="xs" color="#E6EDF3" fontWeight={600}>
          {formatBytes(afterBytes)}
        </Text>
      </Flex>
      <Flex justify="space-between">
        <Text fontSize="xs" color="#8B949E">
          释放
        </Text>
        <Text fontSize="xs" color="#4ECDC4" fontWeight={600}>
          {formatBytes(freedBytes)}
        </Text>
      </Flex>
    </Flex>
  )
}
