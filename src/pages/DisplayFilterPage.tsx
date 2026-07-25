import { useEffect, useState } from 'react'
import { Flex, Text, Button, Box, Slider, SliderTrack, SliderFilledTrack, SliderThumb, SimpleGrid, useToast, Spinner } from '@chakra-ui/react'
import { Palette } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '../components/ui/PageContainer'
import { FilterPreview } from '../components/display/FilterPreview'
import { getFilterPresets, getFilterState, applyColorFilter, removeColorFilter } from '../lib/display-api'
import type { ColorFilter, FilterState } from '../types/display'

export function DisplayFilterPage() {
  const { t } = useTranslation()
  const toast = useToast()
  const [presets, setPresets] = useState<ColorFilter[]>([])
  const [filterState, setFilterState] = useState<FilterState | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)

  // Custom filter sliders
  const [customR, setCustomR] = useState(1.0)
  const [customG, setCustomG] = useState(0.85)
  const [customB, setCustomB] = useState(0.6)
  const [customIntensity, setCustomIntensity] = useState(0.8)

  const load = () => {
    setLoading(true)
    Promise.all([
      getFilterPresets(),
      getFilterState(),
    ])
      .then(([p, s]) => {
        setPresets(p)
        setFilterState(s)
        if (s.active && s.current_filter_id === null) {
          setCustomR(1.0)
          setCustomG(0.85)
          setCustomB(0.6)
          setCustomIntensity(s.intensity)
        }
      })
      .catch(() => toast({ title: '加载失败', status: 'error', duration: 3000 }))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleApplyPreset = async (preset: ColorFilter) => {
    setApplying(true)
    try {
      await applyColorFilter(preset.id, 0.8)
      toast({ title: `已应用 ${preset.name}`, status: 'success', duration: 2000 })
      load()
    } catch (e) {
      toast({ title: '应用失败', description: String(e), status: 'error', duration: 3000 })
    } finally {
      setApplying(false)
    }
  }

  const handleApplyCustom = async () => {
    setApplying(true)
    try {
      await applyColorFilter('custom', customIntensity)
      // Send custom values to the filter window via URL params
      toast({ title: '已应用自定义滤镜', status: 'success', duration: 2000 })
      load()
    } catch (e) {
      toast({ title: '应用失败', description: String(e), status: 'error', duration: 3000 })
    } finally {
      setApplying(false)
    }
  }

  const handleRemove = async () => {
    setApplying(true)
    try {
      await removeColorFilter()
      toast({ title: '滤镜已关闭', status: 'info', duration: 2000 })
      load()
    } catch (e) {
      toast({ title: '关闭失败', description: String(e), status: 'error', duration: 3000 })
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

  const isActive = filterState?.active ?? false

  return (
    <PageContainer>
      <Flex align="center" gap={2} mb={6}>
        <Box as={Palette} size={20} color="#6C63FF" />
        <Text as="h1" fontSize="xl" fontWeight={700} color="#E6EDF3">
          色彩滤镜
        </Text>
      </Flex>

      {/* Presets */}
      <Text fontSize="xs" color="#636D7D" fontWeight={600} textTransform="uppercase" letterSpacing="1px" mb={3}>
        预设滤镜
      </Text>

      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mb={8}>
        {presets.map((preset) => (
          <Flex
            key={preset.id}
            direction="column"
            bg="#161B22"
            border="1px solid"
            borderColor={isActive && filterState?.current_filter_id === preset.id ? '#6C63FF' : '#30363D'}
            borderRadius="12px"
            p={4}
            gap={3}
            transition="all 0.2s"
            _hover={{ borderColor: '#6C63FF' }}
          >
            <FilterPreview
              r={preset.r_multiplier}
              g={preset.g_multiplier}
              b={preset.b_multiplier}
              intensity={preset.opacity}
            />
            <Text fontSize="sm" fontWeight={600} color="#E6EDF3">
              {preset.name}
            </Text>
            <Text fontSize="xs" color="#8B949E">
              {preset.description}
            </Text>
            <Button
              size="xs"
              bg={isActive && filterState?.current_filter_id === preset.id ? '#4ECDC4' : '#6C63FF'}
              color="white"
              borderRadius="6px"
              _hover={{ bg: isActive && filterState?.current_filter_id === preset.id ? '#3DBDB5' : '#5A52D5' }}
              isLoading={applying}
              onClick={() => handleApplyPreset(preset)}
            >
              {isActive && filterState?.current_filter_id === preset.id ? '当前' : '应用'}
            </Button>
          </Flex>
        ))}
      </SimpleGrid>

      {/* Custom */}
      <Text fontSize="xs" color="#636D7D" fontWeight={600} textTransform="uppercase" letterSpacing="1px" mb={3}>
        自定义
      </Text>

      <Box bg="#161B22" border="1px solid" borderColor="#30363D" borderRadius="12px" p={5} mb={6}>
        <Flex gap={6} mb={6} align="center">
          <Box flex={1}>
            <FilterPreview r={customR} g={customG} b={customB} intensity={customIntensity} />
          </Box>
          <Flex direction="column" gap={1} minW="100px">
            <Flex align="center" gap={2}>
              <Box w="12px" h="12px" borderRadius="3px" bg="red.500" />
              <Text fontSize="xs" color="#E6EDF3" w="40px">{customR.toFixed(2)}</Text>
            </Flex>
            <Flex align="center" gap={2}>
              <Box w="12px" h="12px" borderRadius="3px" bg="green.500" />
              <Text fontSize="xs" color="#E6EDF3" w="40px">{customG.toFixed(2)}</Text>
            </Flex>
            <Flex align="center" gap={2}>
              <Box w="12px" h="12px" borderRadius="3px" bg="blue.500" />
              <Text fontSize="xs" color="#E6EDF3" w="40px">{customB.toFixed(2)}</Text>
            </Flex>
          </Flex>
        </Flex>

        <Flex direction="column" gap={4}>
          <Box>
            <Flex justify="space-between" mb={1}>
              <Text fontSize="xs" color="#8B949E">红色通道</Text>
              <Text fontSize="xs" color="#8B949E">{customR.toFixed(2)}</Text>
            </Flex>
            <Slider value={customR} min={0} max={1} step={0.01} onChange={setCustomR}>
              <SliderTrack bg="#30363D">
                <SliderFilledTrack bg="#6C63FF" />
              </SliderTrack>
              <SliderThumb boxSize={4} bg="red.400" />
            </Slider>
          </Box>

          <Box>
            <Flex justify="space-between" mb={1}>
              <Text fontSize="xs" color="#8B949E">绿色通道</Text>
              <Text fontSize="xs" color="#8B949E">{customG.toFixed(2)}</Text>
            </Flex>
            <Slider value={customG} min={0} max={1} step={0.01} onChange={setCustomG}>
              <SliderTrack bg="#30363D">
                <SliderFilledTrack bg="#6C63FF" />
              </SliderTrack>
              <SliderThumb boxSize={4} bg="green.400" />
            </Slider>
          </Box>

          <Box>
            <Flex justify="space-between" mb={1}>
              <Text fontSize="xs" color="#8B949E">蓝色通道</Text>
              <Text fontSize="xs" color="#8B949E">{customB.toFixed(2)}</Text>
            </Flex>
            <Slider value={customB} min={0} max={1} step={0.01} onChange={setCustomB}>
              <SliderTrack bg="#30363D">
                <SliderFilledTrack bg="#6C63FF" />
              </SliderTrack>
              <SliderThumb boxSize={4} bg="blue.400" />
            </Slider>
          </Box>

          <Box>
            <Flex justify="space-between" mb={1}>
              <Text fontSize="xs" color="#8B949E">滤镜强度</Text>
              <Text fontSize="xs" color="#8B949E">{Math.round(customIntensity * 100)}%</Text>
            </Flex>
            <Slider value={customIntensity} min={0} max={1} step={0.01} onChange={setCustomIntensity}>
              <SliderTrack bg="#30363D">
                <SliderFilledTrack bg="#6C63FF" />
              </SliderTrack>
              <SliderThumb boxSize={4} bg="#6C63FF" />
            </Slider>
          </Box>
        </Flex>
      </Box>

      <Flex gap={3}>
        <Button
          size="sm"
          bg="#6C63FF"
          color="white"
          borderRadius="8px"
          _hover={{ bg: '#5A52D5' }}
          isLoading={applying}
          onClick={handleApplyCustom}
        >
          应用自定义滤镜
        </Button>
        <Button
          size="sm"
          variant="outline"
          borderColor="#FF5555"
          color="#FF5555"
          borderRadius="8px"
          _hover={{ bg: 'rgba(255,85,85,0.1)' }}
          isLoading={applying}
          onClick={handleRemove}
          isDisabled={!isActive}
        >
          关闭滤镜
        </Button>
      </Flex>
    </PageContainer>
  )
}
