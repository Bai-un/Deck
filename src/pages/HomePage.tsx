import { useEffect, useMemo } from 'react'
import { Box, SimpleGrid, Flex, Text } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { PageContainer } from '../components/ui/PageContainer'
import { useHardwareStore } from '../stores/useHardwareStore'
import { Cpu, Monitor, MemoryStick, HardDrive, Gauge, Palette, Wrench, Rocket } from 'lucide-react'

function formatBytes(b: number): string {
  if (b >= 1_000_000_000) return `${(b / 1_000_000_000).toFixed(1)} GB`
  if (b >= 1_000_000) return `${(b / 1_000_000).toFixed(1)} MB`
  return `${b} B`
}

function MiniCard({
  icon,
  label,
  value,
  sub,
  color,
  progress,
}: {
  icon: any
  label: string
  value: string
  sub?: string
  color: string
  progress?: number
}) {
  return (
    <Flex
      direction="column"
      bg="#161B22"
      border="1px solid"
      borderColor="#30363D"
      borderRadius="12px"
      p={4}
      gap={2}
    >
      <Flex align="center" gap={2}>
        <Box as={icon} size={16} color={color} />
        <Text fontSize="xs" color="#8B949E" textTransform="uppercase" letterSpacing="wide">
          {label}
        </Text>
      </Flex>
      <Text fontSize="xl" fontWeight="bold" color="#E6EDF3" lineHeight="1.2">
        {value}
      </Text>
      {sub && (
        <Text fontSize="xs" color="#636D7D">
          {sub}
        </Text>
      )}
      {progress !== undefined && (
        <Box w="full" h="4px" bg="#30363D" borderRadius="2px" overflow="hidden" mt={1}>
          <Box
            h="full"
            bg={color}
            borderRadius="2px"
            transition="width 0.6s ease"
            w={`${Math.min(100, Math.max(0, progress))}%`}
          />
        </Box>
      )}
    </Flex>
  )
}

const navCards = [
  { label: '硬件监控', desc: 'CPU、GPU、内存、磁盘实时监控', path: '/hardware', icon: Monitor, color: '#6C63FF' },
  { label: '系统优化', desc: '内存清理、存储清理、网络调优等', path: '/optimize', icon: Rocket, color: '#4ECDC4' },
  { label: '显示增强', desc: '色彩滤镜、DLSS、分辨率工具', path: '/display', icon: Palette, color: '#FFA500' },
  { label: '实用工具', desc: '磁盘健康、GPU改名、系统工具', path: '/tools', icon: Wrench, color: '#FF5555' },
  { label: '快捷启动器', desc: '添加并快速启动常用程序', path: '/launcher', icon: Gauge, color: '#00B4D8' },
]

export function HomePage() {
  const navigate = useNavigate()
  const systemInfo = useHardwareStore((s) => s.systemInfo)
  const snapshot = useHardwareStore((s) => s.currentSnapshot)
  const fetchSystemInfo = useHardwareStore((s) => s.fetchSystemInfo)
  const startMonitor = useHardwareStore((s) => s.startMonitor)

  useEffect(() => {
    fetchSystemInfo()
    startMonitor(2000)
    return () => { useHardwareStore.getState().stopMonitor() }
  }, [])

  const sysInfo = useMemo(() => {
    if (!systemInfo) return null
    const os = `${systemInfo.os_name || 'Windows'} ${systemInfo.os_version || ''}`.trim()
    return {
      os,
      cpu: systemInfo.cpu?.brand || '—',
      gpu: systemInfo.gpus?.[0]?.name || '—',
      ram: systemInfo.total_memory_bytes ? formatBytes(systemInfo.total_memory_bytes) : '—',
      driver: systemInfo.gpus?.[0]?.driver_version || '—',
    }
  }, [systemInfo])

  const cpuUsage = snapshot?.cpu?.usage_percent
  const cpuTemp = snapshot?.cpu?.temperature_c
  const gpuUsage = snapshot?.gpus?.[0]?.usage_percent
  const gpuTemp = snapshot?.gpus?.[0]?.temperature_c
  const memUsed = snapshot?.memory?.used_bytes
  const memTotal = snapshot?.memory?.total_bytes
  const memPercent = snapshot?.memory?.usage_percent
  const diskRead = snapshot?.disks?.[0]?.read_bytes_per_sec

  return (
    <PageContainer>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text as="h1" fontSize="xl" fontWeight={700} color="#E6EDF3">
            Deck
          </Text>
          <Text fontSize="xs" color="#636D7D">欢迎回来</Text>
        </Box>
      </Flex>

      {/* System Overview */}
      <Text fontSize="xs" color="#636D7D" fontWeight={600} textTransform="uppercase" letterSpacing="1px" mb={3}>
        系统概览
      </Text>

      <SimpleGrid columns={{ base: 2, lg: 4 }} gap={3} mb={8}>
        <MiniCard
          icon={Cpu}
          label="CPU"
          value={cpuUsage != null ? `${cpuUsage.toFixed(1)}%` : '—'}
          sub={cpuTemp != null ? `${cpuTemp.toFixed(0)}°C` : undefined}
          color="#6C63FF"
          progress={cpuUsage}
        />
        <MiniCard
          icon={Monitor}
          label="GPU"
          value={gpuUsage != null ? `${gpuUsage.toFixed(1)}%` : '—'}
          sub={gpuTemp != null ? `${gpuTemp.toFixed(0)}°C` : undefined}
          color="#4ECDC4"
          progress={gpuUsage}
        />
        <MiniCard
          icon={MemoryStick}
          label="RAM"
          value={memPercent != null ? `${memPercent.toFixed(0)}%` : '—'}
          sub={memUsed != null && memTotal != null ? `${formatBytes(memUsed)} / ${formatBytes(memTotal)}` : undefined}
          color="#FFA500"
          progress={memPercent}
        />
        <MiniCard
          icon={HardDrive}
          label="C:"
          value={diskRead != null ? `${(diskRead / 1024 / 1024).toFixed(1)} MB/s` : '—'}
          sub="磁盘读写"
          color="#FF5555"
          progress={undefined}
        />
      </SimpleGrid>

      {/* Quick Access */}
      <Text fontSize="xs" color="#636D7D" fontWeight={600} textTransform="uppercase" letterSpacing="1px" mb={3}>
        快捷入口
      </Text>

      <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} gap={3} mb={8}>
        {navCards.map((card) => (
          <Flex
            key={card.path}
            direction="column"
            bg="#161B22"
            border="1px solid"
            borderColor="#30363D"
            borderRadius="12px"
            p={4}
            gap={2}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ borderColor: card.color, boxShadow: `0 4px 12px rgba(0,0,0,0.3)` }}
            onClick={() => navigate(card.path)}
          >
            <Box as={card.icon} size={18} color={card.color} />
            <Text fontSize="sm" fontWeight={600} color="#E6EDF3">
              {card.label}
            </Text>
            <Text fontSize="xs" color="#636D7D">
              {card.desc}
            </Text>
          </Flex>
        ))}
      </SimpleGrid>

      {/* System Info */}
      <Text fontSize="xs" color="#636D7D" fontWeight={600} textTransform="uppercase" letterSpacing="1px" mb={3}>
        系统信息
      </Text>

      <Box bg="#161B22" border="1px solid" borderColor="#30363D" borderRadius="12px" p={4}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={3}>
          {sysInfo ? (
            <>
              <Flex direction="column" gap={0.5}>
                <Text fontSize="xs" color="#636D7D">操作系统</Text>
                <Text fontSize="sm" color="#E6EDF3">{sysInfo.os}</Text>
              </Flex>
              <Flex direction="column" gap={0.5}>
                <Text fontSize="xs" color="#636D7D">CPU</Text>
                <Text fontSize="sm" color="#E6EDF3">{sysInfo.cpu}</Text>
              </Flex>
              <Flex direction="column" gap={0.5}>
                <Text fontSize="xs" color="#636D7D">GPU</Text>
                <Text fontSize="sm" color="#E6EDF3">{sysInfo.gpu}</Text>
              </Flex>
              <Flex direction="column" gap={0.5}>
                <Text fontSize="xs" color="#636D7D">内存</Text>
                <Text fontSize="sm" color="#E6EDF3">{sysInfo.ram}</Text>
              </Flex>
              <Flex direction="column" gap={0.5}>
                <Text fontSize="xs" color="#636D7D">显卡驱动</Text>
                <Text fontSize="sm" color="#E6EDF3">{sysInfo.driver}</Text>
              </Flex>
            </>
          ) : (
            <Text fontSize="sm" color="#8B949E">加载中...</Text>
          )}
        </SimpleGrid>
      </Box>
    </PageContainer>
  )
}
