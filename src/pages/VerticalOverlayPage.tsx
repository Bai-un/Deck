import { useState, useEffect } from 'react'
import { Flex, Text, Box, Switch, useToast, Spinner } from '@chakra-ui/react'
import { PanelRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '../components/ui/PageContainer'
import * as api from '../lib/display-api'
import type { OverlayConfig } from '../types/display'

export function VerticalOverlayPage() {
  const { t } = useTranslation()
  const toast = useToast()
  const [config, setConfig] = useState<OverlayConfig | null>(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.getOverlayConfig()
      .then(setConfig)
      .catch(() => toast({ title: '加载失败', status: 'error', duration: 3000 }))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const updateConfig = (partial: Partial<OverlayConfig>) => {
    if (!config) return
    const updated = { ...config, ...partial }
    setConfig(updated)
    // Auto-save on changes
    api.saveOverlayConfig(updated).catch(() => {})
  }

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

  if (!config) return null

  const displayItems = [
    { key: 'show_cpu', label: 'CPU', defaultChecked: true },
    { key: 'show_gpu', label: 'GPU', defaultChecked: true },
    { key: 'show_memory', label: '内存', defaultChecked: true },
    { key: 'show_disk', label: '磁盘', defaultChecked: false },
    { key: 'show_fps', label: 'FPS', defaultChecked: true },
    { key: 'show_time', label: '时间', defaultChecked: false },
  ]

  return (
    <PageContainer>
      <Flex align="center" gap={2} mb={6}>
        <Box as={PanelRight} size={20} color="#6C63FF" />
        <Text as="h1" fontSize="xl" fontWeight={700} color="#E6EDF3">
          悬浮信息栏
        </Text>
      </Flex>

      {/* Display items toggle */}
      <Text fontSize="xs" color="#636D7D" fontWeight={600} textTransform="uppercase" letterSpacing="1px" mb={3}>
        显示项
      </Text>

      <Box bg="#161B22" border="1px solid" borderColor="#30363D" borderRadius="12px" p={5} mb={6}>
        <Flex direction="column" gap={4}>
          {displayItems.map((item) => (
            <Flex key={item.key} align="center" justify="space-between">
              <Text fontSize="sm" color="#E6EDF3">{item.label}</Text>
              <Switch
                isChecked={(config as any)[item.key] as boolean}
                onChange={(e) => updateConfig({ [item.key]: e.target.checked } as any)}
                sx={{ 'span.chakra-switch__track[data-checked]': { bg: '#6C63FF' } }}
              />
            </Flex>
          ))}
        </Flex>
      </Box>

      {/* Preview */}
      <Text fontSize="xs" color="#636D7D" fontWeight={600} textTransform="uppercase" letterSpacing="1px" mb={3}>
        预览效果
      </Text>

      <Box bg="#161B22" border="1px solid" borderColor="#30363D" borderRadius="12px" p={4} mb={6}>
        <Flex direction="column" align="flex-start" gap={1.5} opacity={config.opacity}>
          {displayItems
            .filter((item) => (config as any)[item.key])
            .slice(0, 5)
            .map((item) => (
              <Flex key={item.key} align="center" gap={2} fontSize={`${config.font_size}px`} color="#E6EDF3">
                <Box w="6px" h="6px" borderRadius="full" bg="#6C63FF" />
                <Text>{item.label}:</Text>
                <Text color="#6C63FF" fontWeight={600}>
                  {item.label === 'CPU' ? '32%' :
                   item.label === 'GPU' ? '45%' :
                   item.label === '内存' ? '8.2/16 GB' :
                   item.label === '磁盘' ? '120 MB/s' :
                   item.label === 'FPS' ? '144' :
                   '12:00'}
                </Text>
              </Flex>
            ))}
        </Flex>
      </Box>

      <Text fontSize="xs" color="#636D7D">
        拖拽排序请在桌面端使用。配置会自动保存。
      </Text>
    </PageContainer>
  )
}
