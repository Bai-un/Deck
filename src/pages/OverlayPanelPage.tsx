import { useEffect, useState } from 'react'
import {
  Flex, Text, Button, Box, Switch, Slider, SliderTrack, SliderFilledTrack, SliderThumb,
  Select, useToast, Spinner,
} from '@chakra-ui/react'
import { Layers } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '../components/ui/PageContainer'
import * as api from '../lib/display-api'
import type { OverlayConfig } from '../types/display'

export function OverlayPanelPage() {
  const { t } = useTranslation()
  const toast = useToast()
  const [config, setConfig] = useState<OverlayConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
    setConfig({ ...config, ...partial })
  }

  const handleSave = async () => {
    if (!config) return
    setSaving(true)
    try {
      await api.saveOverlayConfig(config)
      toast({ title: '配置已保存', status: 'success', duration: 2000 })
    } catch (e) {
      toast({ title: '保存失败', description: String(e), status: 'error', duration: 3000 })
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async () => {
    if (!config) return
    const newEnabled = !config.enabled
    setSaving(true)
    try {
      await api.toggleOverlay(newEnabled)
      updateConfig({ enabled: newEnabled })
      toast({ title: newEnabled ? '覆盖面板已开启' : '覆盖面板已关闭', status: 'success', duration: 2000 })
    } catch (e) {
      toast({ title: '操作失败', description: String(e), status: 'error', duration: 3000 })
    } finally {
      setSaving(false)
    }
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

  return (
    <PageContainer>
      <Flex align="center" gap={2} mb={6}>
        <Box as={Layers} size={20} color="#6C63FF" />
        <Text as="h1" fontSize="xl" fontWeight={700} color="#E6EDF3">
          覆盖面板设置
        </Text>
      </Flex>

      {/* Display items */}
      <Text fontSize="xs" color="#636D7D" fontWeight={600} textTransform="uppercase" letterSpacing="1px" mb={3}>
        显示项目
      </Text>

      <Box bg="#161B22" border="1px solid" borderColor="#30363D" borderRadius="12px" p={5} mb={6}>
        <Flex direction="column" gap={4}>
          {[
            { key: 'show_cpu', label: 'CPU 使用率' },
            { key: 'show_gpu', label: 'GPU 使用率' },
            { key: 'show_memory', label: '内存使用' },
            { key: 'show_disk', label: '磁盘读写' },
            { key: 'show_fps', label: 'FPS' },
            { key: 'show_time', label: '系统时间' },
          ].map((item) => (
            <Flex key={item.key} align="center" justify="space-between">
              <Text fontSize="sm" color="#E6EDF3">{item.label}</Text>
              <Switch
                isChecked={(config as any)[item.key] as boolean}
                onChange={(e) => updateConfig({ [item.key]: e.target.checked } as any)}
                sx={{
                  'span.chakra-switch__track[data-checked]': { bg: '#6C63FF' },
                }}
              />
            </Flex>
          ))}
        </Flex>
      </Box>

      {/* Appearance */}
      <Text fontSize="xs" color="#636D7D" fontWeight={600} textTransform="uppercase" letterSpacing="1px" mb={3}>
        外观设置
      </Text>

      <Box bg="#161B22" border="1px solid" borderColor="#30363D" borderRadius="12px" p={5} mb={6}>
        <Flex direction="column" gap={5}>
          <Box>
            <Flex justify="space-between" mb={1}>
              <Text fontSize="xs" color="#8B949E">位置</Text>
            </Flex>
            <Select
              value={config.position}
              onChange={(e) => updateConfig({ position: e.target.value })}
              bg="#0D1117"
              border="1px solid"
              borderColor="#30363D"
              color="#E6EDF3"
              fontSize="sm"
              borderRadius="8px"
              _focus={{ borderColor: '#6C63FF' }}
            >
              <option value="top_left">左上角</option>
              <option value="top_right">右上角</option>
              <option value="bottom_left">左下角</option>
              <option value="bottom_right">右下角</option>
            </Select>
          </Box>

          <Box>
            <Flex justify="space-between" mb={1}>
              <Text fontSize="xs" color="#8B949E">透明度</Text>
              <Text fontSize="xs" color="#8B949E">{Math.round(config.opacity * 100)}%</Text>
            </Flex>
            <Slider value={config.opacity} min={0.1} max={1} step={0.05} onChange={(v) => updateConfig({ opacity: v })}>
              <SliderTrack bg="#30363D"><SliderFilledTrack bg="#6C63FF" /></SliderTrack>
              <SliderThumb boxSize={4} bg="#6C63FF" />
            </Slider>
          </Box>

          <Box>
            <Flex justify="space-between" mb={1}>
              <Text fontSize="xs" color="#8B949E">字号</Text>
              <Text fontSize="xs" color="#8B949E">{config.font_size}px</Text>
            </Flex>
            <Slider value={config.font_size} min={10} max={24} step={1} onChange={(v) => updateConfig({ font_size: v })}>
              <SliderTrack bg="#30363D"><SliderFilledTrack bg="#6C63FF" /></SliderTrack>
              <SliderThumb boxSize={4} bg="#6C63FF" />
            </Slider>
          </Box>

          <Box>
            <Flex justify="space-between" mb={1}>
              <Text fontSize="xs" color="#8B949E">刷新间隔</Text>
            </Flex>
            <Select
              value={config.refresh_rate_ms}
              onChange={(e) => updateConfig({ refresh_rate_ms: Number(e.target.value) })}
              bg="#0D1117"
              border="1px solid"
              borderColor="#30363D"
              color="#E6EDF3"
              fontSize="sm"
              borderRadius="8px"
              _focus={{ borderColor: '#6C63FF' }}
            >
              <option value={500}>500ms</option>
              <option value={1000}>1000ms</option>
              <option value={2000}>2000ms</option>
              <option value={5000}>5000ms</option>
            </Select>
          </Box>

          <Flex align="center" justify="space-between">
            <Text fontSize="xs" color="#8B949E">背景模糊</Text>
            <Switch
              isChecked={config.background_blur}
              onChange={(e) => updateConfig({ background_blur: e.target.checked })}
              sx={{ 'span.chakra-switch__track[data-checked]': { bg: '#6C63FF' } }}
            />
          </Flex>
        </Flex>
      </Box>

      <Flex gap={3}>
        <Button
          size="sm"
          bg={config.enabled ? '#FF5555' : '#6C63FF'}
          color="white"
          borderRadius="8px"
          _hover={{ bg: config.enabled ? '#CC0000' : '#5A52D5' }}
          isLoading={saving}
          onClick={handleToggle}
        >
          {config.enabled ? '关闭覆盖面板' : '开启覆盖面板'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          borderColor="#30363D"
          color="#E6EDF3"
          borderRadius="8px"
          _hover={{ bg: 'rgba(255,255,255,0.05)' }}
          isLoading={saving}
          onClick={handleSave}
        >
          保存配置
        </Button>
      </Flex>
    </PageContainer>
  )
}
