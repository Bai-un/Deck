import { Heading, Text, Flex, Button, useDisclosure, Box } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { Info } from 'lucide-react'
import { PageContainer } from '../components/ui/PageContainer'
import { CpuCard } from '../components/hardware/CpuCard'
import { GpuCard } from '../components/hardware/GpuCard'
import { MemoryCard } from '../components/hardware/MemoryCard'
import { DiskCard } from '../components/hardware/DiskCard'
import { HardwareDetailModal } from '../components/hardware/HardwareDetailModal'
import { useHardwareInfo } from '../hooks/useHardwareInfo'
import { useSensorData } from '../hooks/useSensorData'
import { useHardwareStore } from '../stores/useHardwareStore'

export function HardwarePage() {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { systemInfo } = useHardwareInfo()
  useSensorData()

  const currentSnapshot = useHardwareStore((s) => s.currentSnapshot)
  const cpuHistory = useHardwareStore((s) => s.cpuHistory)
  const gpuHistory = useHardwareStore((s) => s.gpuHistory)
  const memoryHistory = useHardwareStore((s) => s.memoryHistory)

  return (
    <PageContainer>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading as="h1" size="lg" mb={1}>
            {t('pages.hardware.title')}
          </Heading>
          <Text color="#8B949E" fontSize="sm">
            {t('pages.hardware.desc')}
          </Text>
        </Box>
        <Button
          leftIcon={<Info size={16} />}
          variant="ghost"
          size="sm"
          color="#8B949E"
          _hover={{ color: '#E6EDF3', bg: 'rgba(255,255,255,0.05)' }}
          onClick={onOpen}
        >
          {t('hardware.detail')}
        </Button>
      </Flex>

      {/* CPU + GPU row */}
      <Flex gap={4} mb={4} direction={{ base: 'column', md: 'row' }}>
        <CpuCard
          data={currentSnapshot?.cpu ?? null}
          history={cpuHistory}
          brand={systemInfo?.cpu.brand ?? '—'}
          coreCount={systemInfo?.cpu.core_count ?? 0}
          threadCount={systemInfo?.cpu.thread_count ?? 0}
        />
        <GpuCard
          data={currentSnapshot?.gpus[0] ?? null}
          history={gpuHistory}
          info={systemInfo?.gpus[0] ?? null}
        />
      </Flex>

      {/* Memory */}
      <Box mb={4}>
        <MemoryCard
          data={currentSnapshot?.memory ?? null}
          history={memoryHistory}
          totalMemoryBytes={systemInfo?.total_memory_bytes ?? 0}
        />
      </Box>

      {/* Disks */}
      <DiskCard
        disks={currentSnapshot?.disks ?? []}
        diskInfo={systemInfo?.disks ?? []}
      />

      {/* Detail Modal */}
      <HardwareDetailModal
        isOpen={isOpen}
        onClose={onClose}
        info={systemInfo}
      />
    </PageContainer>
  )
}
