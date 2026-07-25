import { useEffect, useState, useMemo } from 'react'
import {
  Flex, Text, Button, Box, SimpleGrid, Slider, SliderTrack, SliderFilledTrack, SliderThumb,
  Select, useToast, Spinner,
} from '@chakra-ui/react'
import { Monitor } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '../components/ui/PageContainer'
import { ResolutionCard } from '../components/display/ResolutionCard'
import { getAvailableResolutions, setResolution, resetToNativeResolution, getDisplayInfo } from '../lib/display-api'
import type { DisplayInfo, ResolutionPreset } from '../types/display'

export function ResolutionConverterPage() {
  const { t } = useTranslation()
  const toast = useToast()
  const [displayInfo, setDisplayInfo] = useState<DisplayInfo | null>(null)
  const [presets, setPresets] = useState<ResolutionPreset[]>([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)

  // Custom calculator
  const [targetRatio, setTargetRatio] = useState('16:9')
  const [scalePercent, setScalePercent] = useState(75)
  const [selectedRate, setSelectedRate] = useState(60)

  const load = () => {
    setLoading(true)
    Promise.all([
      getDisplayInfo(),
      getAvailableResolutions(),
    ])
      .then(([info, res]) => {
        setDisplayInfo(info)
        setPresets(res)
        setSelectedRate(info.current_refresh_rate)
      })
      .catch(() => toast({ title: '加载失败', status: 'error', duration: 3000 }))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const calcResult = useMemo(() => {
    if (!displayInfo) return { width: 0, height: 0 }
    // Client-side calculation (same formula as Rust backend)
    const scale = Math.max(0.5, Math.min(1, scalePercent / 100))
    const parts = targetRatio.split(':').map(Number)
    if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) {
      const w = Math.floor(displayInfo.native_height * parts[0] / parts[1] * scale / 2) * 2
      const h = Math.floor(displayInfo.native_height * scale / 2) * 2
      return { width: Math.max(640, w), height: Math.max(480, h) }
    }
    // Fallback: simple scaling
    const w = Math.floor(displayInfo.native_width * scale / 2) * 2
    const h = Math.floor(displayInfo.native_height * scale / 2) * 2
    return { width: Math.max(640, w), height: Math.max(480, h) }
  }, [displayInfo, targetRatio, scalePercent])

  const handleApply = async (width: number, height: number, refreshRate: number) => {
    setApplying(true)
    try {
      await setResolution(width, height, refreshRate)
      toast({ title: `已切换至 ${width}×${height}`, status: 'success', duration: 3000 })
      toast({
        title: '如显示异常，15 秒后将自动恢复',
        status: 'warning',
        duration: 5000,
      })
    } catch (e) {
      toast({ title: '切换失败', description: String(e), status: 'error', duration: 3000 })
    } finally {
      setApplying(false)
    }
  }

  const handleApplyPreset = (preset: ResolutionPreset) => {
    handleApply(preset.width, preset.height, preset.refresh_rate)
  }

  const handleReset = async () => {
    setApplying(true)
    try {
      await resetToNativeResolution()
      toast({ title: '已恢复原生分辨率', status: 'success', duration: 2000 })
      load()
    } catch (e) {
      toast({ title: '恢复失败', description: String(e), status: 'error', duration: 3000 })
    } finally {
      setApplying(false)
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

  return (
    <PageContainer>
      <Flex align="center" gap={2} mb={6}>
        <Box as={Monitor} size={20} color="#6C63FF" />
        <Text as="h1" fontSize="xl" fontWeight={700} color="#E6EDF3">
          分辨率工具
        </Text>
      </Flex>

      {/* Current Display Info */}
      {displayInfo && (
        <Box bg="#161B22" border="1px solid" borderColor="#30363D" borderRadius="12px" p={4} mb={6}>
          <Text fontSize="sm" color="#E6EDF3">
            当前: {displayInfo.current_width}×{displayInfo.current_height} @ {displayInfo.current_refresh_rate}Hz
            <Text as="span" color="#4ECDC4" fontSize="xs" ml={2}>(原生)</Text>
          </Text>
        </Box>
      )}

      {/* Quick Presets */}
      <Text fontSize="xs" color="#636D7D" fontWeight={600} textTransform="uppercase" letterSpacing="1px" mb={3}>
        快捷方案
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4} mb={8}>
        {presets.slice(0, 6).map((preset) => (
          <ResolutionCard
            key={preset.id}
            preset={preset}
            onApply={handleApplyPreset}
            loading={applying}
          />
        ))}
      </SimpleGrid>

      {/* Custom Calculator */}
      <Text fontSize="xs" color="#636D7D" fontWeight={600} textTransform="uppercase" letterSpacing="1px" mb={3}>
        自定义计算
      </Text>

      <Box bg="#161B22" border="1px solid" borderColor="#30363D" borderRadius="12px" p={5} mb={6}>
        <Flex gap={8} wrap="wrap">
          <Box flex={1} minW="200px">
            <Flex justify="space-between" mb={1}>
              <Text fontSize="xs" color="#8B949E">目标宽高比</Text>
            </Flex>
            <Select
              value={targetRatio}
              onChange={(e) => setTargetRatio(e.target.value)}
              bg="#0D1117"
              border="1px solid"
              borderColor="#30363D"
              color="#E6EDF3"
              fontSize="sm"
              borderRadius="8px"
              _focus={{ borderColor: '#6C63FF' }}
              mb={4}
            >
              <option value="16:9">16:9</option>
              <option value="16:10">16:10</option>
              <option value="21:9">21:9</option>
              <option value="4:3">4:3</option>
            </Select>

            <Box mb={4}>
              <Flex justify="space-between" mb={1}>
                <Text fontSize="xs" color="#8B949E">缩放比例</Text>
                <Text fontSize="xs" color="#8B949E">{scalePercent}%</Text>
              </Flex>
              <Slider value={scalePercent} min={50} max={100} step={5} onChange={setScalePercent}>
                <SliderTrack bg="#30363D">
                  <SliderFilledTrack bg="#6C63FF" />
                </SliderTrack>
                <SliderThumb boxSize={4} bg="#6C63FF" />
              </Slider>
            </Box>

            <Box mb={4}>
              <Flex justify="space-between" mb={1}>
                <Text fontSize="xs" color="#8B949E">计算结果</Text>
              </Flex>
              <Text fontSize="lg" fontWeight={700} color="#6C63FF">
                {calcResult.width} × {calcResult.height}
              </Text>
            </Box>

            <Flex gap={2}>
              <Button
                size="sm"
                bg="#6C63FF"
                color="white"
                borderRadius="6px"
                _hover={{ bg: '#5A52D5' }}
                isLoading={applying}
                isDisabled={!calcResult.width}
                onClick={() => handleApply(calcResult.width, calcResult.height, selectedRate)}
              >
                应用分辨率
              </Button>
              <Button
                size="sm"
                variant="outline"
                borderColor="#30363D"
                color="#E6EDF3"
                borderRadius="6px"
                _hover={{ bg: 'rgba(255,255,255,0.05)' }}
                isLoading={applying}
                onClick={handleReset}
              >
                恢复原生
              </Button>
            </Flex>
          </Box>
        </Flex>
      </Box>

      <Box bg="rgba(255, 165, 0, 0.1)" border="1px solid" borderColor="rgba(255, 165, 0, 0.3)" borderRadius="8px" p={3}>
        <Text fontSize="xs" color="#FFA500">
          ⚠ 切换分辨率后如显示异常，等待 15 秒将自动恢复
        </Text>
      </Box>
    </PageContainer>
  )
}
