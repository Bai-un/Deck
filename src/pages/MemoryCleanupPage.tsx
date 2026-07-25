import { useEffect } from 'react'
import { Flex, Text, Button, Box, Spinner } from '@chakra-ui/react'
import { MemoryStick } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '../components/ui/PageContainer'
import { MemoryGauge } from '../components/cleanup/MemoryGauge'
import { CleanupResultCard } from '../components/cleanup/CleanupResultCard'
import { useCleanupStore } from '../stores/useCleanupStore'

export function MemoryCleanupPage() {
  const { t } = useTranslation()
  const {
    memoryStatus,
    lastMemoryCleanup,
    cleaningMemory,
    fetchMemoryStatus,
    cleanupMemory,
  } = useCleanupStore()

  useEffect(() => {
    fetchMemoryStatus()
  }, [fetchMemoryStatus])

  return (
    <PageContainer>
      <Flex align="center" gap={2} mb={6}>
        <Box as={MemoryStick} size={20} color="#6C63FF" />
        <Text as="h1" fontSize="xl" fontWeight={700} color="#E6EDF3">
          {t('cleanup.memory.title')}
        </Text>
      </Flex>

      {/* Gauge */}
      <Flex justify="center" mb={6}>
        {memoryStatus ? (
          <MemoryGauge
            percent={memoryStatus.usage_percent}
            usedBytes={memoryStatus.used_bytes}
            totalBytes={memoryStatus.total_bytes}
          />
        ) : (
          <Spinner color="#6C63FF" size="lg" />
        )}
      </Flex>

      {/* Stats */}
      {memoryStatus && (
        <Flex justify="center" gap={8} mb={6}>
          <Box textAlign="center">
            <Text fontSize="sm" color="#E6EDF3" fontWeight={600}>
              {formatBytes(memoryStatus.used_bytes)}
            </Text>
            <Text fontSize="xs" color="#8B949E">
              {t('cleanup.memory.title')}
            </Text>
          </Box>
          <Box textAlign="center">
            <Text fontSize="sm" color="#E6EDF3" fontWeight={600}>
              {formatBytes(memoryStatus.available_bytes)}
            </Text>
            <Text fontSize="xs" color="#8B949E">
              {t('cleanup.memory.available')}
            </Text>
          </Box>
        </Flex>
      )}

      {/* Cleanup button */}
      <Flex justify="center" mb={6}>
        <Button
          bg="#6C63FF"
          color="white"
          size="lg"
          borderRadius="12px"
          px={8}
          isLoading={cleaningMemory}
          loadingText={t('cleanup.memory.cleaning')}
          _hover={{ bg: '#5A52D5' }}
          onClick={cleanupMemory}
        >
          {t('cleanup.memory.cleanup')}
        </Button>
      </Flex>

      {/* Last result */}
      {lastMemoryCleanup && (
        <Box maxW="300px" mx="auto">
          <CleanupResultCard
            freedBytes={lastMemoryCleanup.freed_bytes}
            beforeBytes={lastMemoryCleanup.before_used_bytes}
            afterBytes={lastMemoryCleanup.after_used_bytes}
            label={t('cleanup.memory.lastCleanup')}
          />
        </Box>
      )}
    </PageContainer>
  )
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const idx = Math.min(i, units.length - 1)
  return `${(bytes / Math.pow(1024, idx)).toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`
}
