import { useEffect, useState } from 'react'
import { Flex, Text, Button, Box, useToast, Spinner } from '@chakra-ui/react'
import { Cpu, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '../components/ui/PageContainer'
import { getDlssPresets, setDlssPreset, isNvidiaAvailable } from '../lib/display-api'
import type { DLSSPreset } from '../types/display'

export function DLSSPresetPage() {
  const { t } = useTranslation()
  const toast = useToast()
  const [presets, setPresets] = useState<DLSSPreset[]>([])
  const [hasNvidia, setHasNvidia] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const [p, nvidia] = await Promise.all([
        getDlssPresets(),
        isNvidiaAvailable(),
      ])
      setPresets(p)
      setHasNvidia(nvidia)
    } catch {
      toast({ title: '加载失败', status: 'error', duration: 3000 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleApply = async (presetId: string) => {
    setApplying(presetId)
    try {
      await setDlssPreset(presetId)
      setPresets((prev) =>
        prev.map((p) => ({ ...p, is_active: p.id === presetId }))
      )
      toast({ title: '已切换 DLSS 预设', status: 'success', duration: 2000 })
    } catch (e) {
      toast({ title: '设置失败', description: String(e), status: 'error', duration: 3000 })
    } finally {
      setApplying(null)
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

  if (hasNvidia === false) {
    return (
      <PageContainer>
        <Flex align="center" gap={2} mb={6}>
          <Box as={Cpu} size={20} color="#6C63FF" />
          <Text as="h1" fontSize="xl" fontWeight={700} color="#E6EDF3">
            DLSS 预设配置
          </Text>
        </Flex>
        <Flex
          direction="column"
          align="center"
          justify="center"
          bg="#161B22"
          border="1px solid"
          borderColor="#30363D"
          borderRadius="12px"
          p={10}
          gap={4}
        >
          <AlertTriangle size={32} color="#FFA500" />
          <Text color="#8B949E" fontSize="sm" textAlign="center">
            此功能需要 NVIDIA GPU，未检测到 NVIDIA 设备
          </Text>
        </Flex>
      </PageContainer>
    )
  }

  const renderScaleLabel = (scale: number) => `${Math.round(scale * 100)}%`

  return (
    <PageContainer>
      <Flex align="center" gap={2} mb={6}>
        <Box as={Cpu} size={20} color="#6C63FF" />
        <Text as="h1" fontSize="xl" fontWeight={700} color="#E6EDF3">
          DLSS 预设配置
        </Text>
      </Flex>

      <Box bg="#161B22" border="1px solid" borderColor="#30363D" borderRadius="12px" overflow="hidden">
        {presets.map((preset, i) => (
          <Flex
            key={preset.id}
            p={4}
            align="center"
            justify="space-between"
            borderTop={i > 0 ? '1px solid' : 'none'}
            borderColor="#30363D"
            bg={preset.is_active ? 'rgba(108,99,255,0.08)' : 'transparent'}
          >
            <Box>
              <Flex align="center" gap={2}>
                <Text fontSize="sm" fontWeight={600} color="#E6EDF3">
                  {preset.name}
                </Text>
                <Text fontSize="xs" color="#8B949E">
                  渲染比例 {renderScaleLabel(preset.render_scale)}
                </Text>
                {preset.is_active && (
                  <Box bg="#6C63FF" color="white" fontSize="10px" fontWeight={600} px={2} py={0.5} borderRadius="4px">
                    当前
                  </Box>
                )}
              </Flex>
              <Text fontSize="xs" color="#636D7D" mt={1}>
                {preset.description}
              </Text>
            </Box>
            {!preset.is_active && (
              <Button
                size="xs"
                bg="#6C63FF"
                color="white"
                borderRadius="6px"
                _hover={{ bg: '#5A52D5' }}
                isLoading={applying === preset.id}
                onClick={() => handleApply(preset.id)}
              >
                应用
              </Button>
            )}
          </Flex>
        ))}
      </Box>
    </PageContainer>
  )
}
