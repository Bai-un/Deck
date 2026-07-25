import { useEffect, useState } from 'react'
import { Box, Flex, Text, SimpleGrid, Icon } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { PageContainer } from '../components/ui/PageContainer'
import {
  MemoryStick, HardDrive, Cpu, Wifi, Zap, Power, Mouse,
} from 'lucide-react'
import { getMemoryStatus, getShaderCaches } from '../lib/cleanup-api'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const idx = Math.min(i, units.length - 1)
  return `${(bytes / Math.pow(1024, idx)).toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`
}

interface CardDef {
  icon: any
  label: string
  path: string
  summary: string
  color: string
}

export function OptimizePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [memoryUsage, setMemoryUsage] = useState<string | null>(null)
  const [shaderSize, setShaderSize] = useState<string | null>(null)

  useEffect(() => {
    getMemoryStatus().then((s) => {
      setMemoryUsage(`${s.usage_percent.toFixed(1)}%`)
    }).catch(() => {})
    getShaderCaches().then((caches) => {
      const total = caches.reduce((sum, c) => sum + c.size_bytes, 0)
      setShaderSize(formatBytes(total))
    }).catch(() => {})
  }, [])

  const cleanupCards: CardDef[] = [
    {
      icon: MemoryStick,
      label: t('cleanup.memory.title'),
      path: '/optimize/memory',
      summary: memoryUsage ?? t('common.loading'),
      color: '#6C63FF',
    },
    {
      icon: HardDrive,
      label: t('cleanup.storage.title'),
      path: '/optimize/storage',
      summary: t('cleanup.storage.scan'),
      color: '#4ECDC4',
    },
    {
      icon: Cpu,
      label: t('cleanup.shader.title'),
      path: '/optimize/shader',
      summary: shaderSize ?? t('common.loading'),
      color: '#A66CFF',
    },
  ]

  const tuningCards: CardDef[] = [
    {
      icon: Wifi,
      label: t('tuning.network.title'),
      path: '/optimize/network',
      summary: t('tuning.common.optimized'),
      color: '#6C63FF',
    },
    {
      icon: Zap,
      label: t('tuning.power.title'),
      path: '/optimize/power',
      summary: t('tuning.power.builtinPlans'),
      color: '#FFA500',
    },
    {
      icon: Power,
      label: t('tuning.startup.title'),
      path: '/optimize/startup',
      summary: t('tuning.startup.totalItems', { count: 0 }).replace('0', ''),
      color: '#4ECDC4',
    },
    {
      icon: Mouse,
      label: t('tuning.peripheral.title'),
      path: '/optimize/peripheral',
      summary: t('tuning.peripheral.optimizeAll'),
      color: '#A66CFF',
    },
  ]

  const renderCard = (card: CardDef) => (
    <Flex
      key={card.path}
      direction="column"
      bg="#161B22"
      border="1px solid"
      borderColor="#30363D"
      borderRadius="12px"
      p={5}
      gap={4}
      cursor="pointer"
      transition="all 0.2s"
      _hover={{
        borderColor: '#6C63FF',
        boxShadow: '0 4px 12px rgba(108, 99, 255, 0.1)',
      }}
      onClick={() => navigate(card.path)}
    >
      <Flex align="center" gap={3}>
        <Box
          w="40px"
          h="40px"
          borderRadius="10px"
          bg={`${card.color}20`}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={card.icon} size={20} color={card.color} />
        </Box>
        <Box>
          <Text fontSize="sm" fontWeight={600} color="#E6EDF3">
            {card.label}
          </Text>
          <Text fontSize="xs" color="#8B949E">
            {card.summary}
          </Text>
        </Box>
      </Flex>
    </Flex>
  )

  return (
    <PageContainer>
      <Text as="h1" fontSize="xl" fontWeight={700} color="#E6EDF3" mb={1}>
        {t('pages.optimize.title')}
      </Text>
      <Text color="#8B949E" fontSize="sm" mb={6}>
        {t('pages.optimize.desc')}
      </Text>

      <Text fontSize="xs" color="#636D7D" fontWeight={600} textTransform="uppercase" letterSpacing="1px" mb={3}>
        清理
      </Text>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mb={8}>
        {cleanupCards.map(renderCard)}
      </SimpleGrid>

      <Text fontSize="xs" color="#636D7D" fontWeight={600} textTransform="uppercase" letterSpacing="1px" mb={3}>
        调优
      </Text>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
        {tuningCards.map(renderCard)}
      </SimpleGrid>
    </PageContainer>
  )
}
