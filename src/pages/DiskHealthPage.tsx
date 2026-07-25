import { useEffect, useState } from 'react'
import { Flex, Text, Box, useToast, Spinner, SimpleGrid, Progress, Collapse, Button } from '@chakra-ui/react'
import { HardDrive, ChevronDown, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '../components/ui/PageContainer'
import { DiskCard } from '../components/tools/DiskCard'
import { getDiskHealth } from '../lib/tools-api'
import type { DiskHealth } from '../types/tools'

export function DiskHealthPage() {
  const { t } = useTranslation()
  const toast = useToast()
  const [disks, setDisks] = useState<DiskHealth[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDiskHealth()
      .then(setDisks)
      .catch(() => toast({ title: '加载失败', status: 'error', duration: 3000 }))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <PageContainer>
        <Flex direction="column" align="center" justify="center" py={20} gap={4}>
          <Spinner size="xl" color="#6C63FF" />
          <Text color="#8B949E" fontSize="sm">{t('common.loading')}</Text>
        </Flex>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <Flex align="center" gap={2} mb={6}>
        <Box as={HardDrive} size={20} color="#6C63FF" />
        <Text as="h1" fontSize="xl" fontWeight={700} color="#E6EDF3">
          磁盘健康检测
        </Text>
      </Flex>

      <SimpleGrid columns={{ base: 1 }} gap={4}>
        {disks.map((disk) => (
          <DiskCard key={disk.name} disk={disk} />
        ))}
      </SimpleGrid>

      {disks.length === 0 && (
        <Flex direction="column" align="center" justify="center" py={10} bg="#161B22" borderRadius="12px" border="1px solid" borderColor="#30363D">
          <Text color="#8B949E" fontSize="sm">未检测到磁盘</Text>
        </Flex>
      )}
    </PageContainer>
  )
}
