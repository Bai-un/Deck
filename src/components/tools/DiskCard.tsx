import { useState } from 'react'
import { Flex, Text, Box, Button, Collapse, Progress } from '@chakra-ui/react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { DiskHealth } from '../../types/tools'
import { SmartAttrRow } from './SmartAttrRow'

interface Props {
  disk: DiskHealth
}

export function DiskCard({ disk }: Props) {
  const [expanded, setExpanded] = useState(false)

  const healthColor = disk.health_percent >= 80 ? '#4ECDC4' : disk.health_percent >= 50 ? '#FFA500' : '#FF5555'
  const statusLabel = disk.health_percent >= 80 ? '良好' : disk.health_percent >= 50 ? '注意' : '危险'

  const formatBytes = (b: number) => {
    if (b >= 1_000_000_000_000) return `${(b / 1_000_000_000_000).toFixed(1)} TB`
    if (b >= 1_000_000_000) return `${(b / 1_000_000_000).toFixed(0)} GB`
    return `${(b / 1_000_000).toFixed(0)} MB`
  }

  return (
    <Box bg="#161B22" border="1px solid" borderColor="#30363D" borderRadius="12px" overflow="hidden">
      <Box p={5}>
        <Flex align="center" justify="space-between" mb={3}>
          <Box>
            <Text fontSize="sm" fontWeight={600} color="#E6EDF3">
              {disk.model}
            </Text>
            <Text fontSize="xs" color="#636D7D" mt={0.5}>
              {disk.interface} · 固件 {disk.firmware}
              {disk.power_on_hours != null && ` · 通电 ${disk.power_on_hours}h`}
            </Text>
          </Box>
          <Flex direction="column" align="flex-end">
            <Text fontSize="lg" fontWeight={700} color={healthColor}>
              {disk.health_percent}%
            </Text>
            <Text fontSize="xs" color={healthColor}>{statusLabel}</Text>
          </Flex>
        </Flex>

        <Flex gap={4} mb={3}>
          <Box flex={1}>
            <Text fontSize="xs" color="#636D7D">容量</Text>
            <Text fontSize="sm" color="#E6EDF3">{formatBytes(disk.capacity_bytes)}</Text>
          </Box>
          <Box flex={1}>
            <Text fontSize="xs" color="#636D7D">序列号</Text>
            <Text fontSize="sm" color="#E6EDF3">{disk.serial}</Text>
          </Box>
          {disk.temperature_c != null && (
            <Box flex={1}>
              <Text fontSize="xs" color="#636D7D">温度</Text>
              <Text fontSize="sm" color="#E6EDF3">{disk.temperature_c}°C</Text>
            </Box>
          )}
        </Flex>

        <Box mb={3}>
          <Flex justify="space-between" mb={1}>
            <Text fontSize="xs" color="#636D7D">健康度</Text>
            <Text fontSize="xs" color={healthColor}>{disk.health_percent}%</Text>
          </Flex>
          <Progress
            value={disk.health_percent}
            size="sm"
            borderRadius="4px"
            bg="#30363D"
            sx={{
              '& > div': {
                bg: healthColor,
                borderRadius: '4px',
                transition: 'width 0.6s ease',
              },
            }}
          />
        </Box>

        <Button
          size="xs"
          variant="ghost"
          color="#8B949E"
          rightIcon={expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          _hover={{ color: '#E6EDF3' }}
          onClick={() => setExpanded(!expanded)}
        >
          S.M.A.R.T. 属性 ({disk.smart_attributes.length} 项)
        </Button>

        <Collapse in={expanded}>
          <Box mt={3} borderTop="1px solid" borderColor="#30363D" pt={2}>
            <Flex justify="space-between" mb={2}>
              <Text fontSize="xs" color="#636D7D" flex={2}>属性</Text>
              <Text fontSize="xs" color="#636D7D" flex={3} textAlign="center">
                <Text as="span" mx={1}>当前</Text>
                <Text as="span" mx={1}>最差</Text>
                <Text as="span" mx={1}>阈值</Text>
                <Text as="span" mx={2}>原始值</Text>
              </Text>
            </Flex>
            {disk.smart_attributes.map((attr) => (
              <SmartAttrRow key={attr.id} attr={attr} />
            ))}
          </Box>
        </Collapse>
      </Box>
    </Box>
  )
}
