import { useEffect, useState } from 'react'
import {
  Flex, Text, Button, Box, Divider, Spinner, Select, useToast,
} from '@chakra-ui/react'
import { Mouse, Keyboard, Usb } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '../components/ui/PageContainer'
import { getPeripheralTweaks, applyPeripheralTweak, resetPeripheralTweaks } from '../lib/tuning-api'
import type { PeripheralTweak } from '../types/tuning'

function TweakItem({
  tweak,
  onApply,
  loading,
}: {
  tweak: PeripheralTweak
  onApply: (id: string, value: string) => void
  loading: boolean
}) {
  const [selected, setSelected] = useState(tweak.current_value)

  return (
    <Flex
      align="center"
      justify="space-between"
      py={3}
      px={4}
      _hover={{ bg: 'rgba(255,255,255,0.02)' }}
    >
      <Flex align="center" gap={3} flex={1}>
        <Box
          w="8px"
          h="8px"
          borderRadius="full"
          bg={tweak.is_optimized ? '#4ECDC4' : '#636D7D'}
          flexShrink={0}
        />
        <Box flex={1}>
          <Text fontSize="sm" color="#E6EDF3" fontWeight={500}>
            {tweak.name}
          </Text>
          <Text fontSize="xs" color="#8B949E">
            {tweak.description}
          </Text>
          <Text fontSize="11px" color="#636D7D" fontFamily="monospace">
            当前值: {tweak.current_value}
          </Text>
        </Box>
      </Flex>
      {tweak.available_options.length > 2 ? (
        <Select
          size="sm"
          value={selected}
          onChange={(e) => { setSelected(e.target.value); onApply(tweak.id, e.target.value) }}
          bg="#0D1117"
          border="1px solid"
          borderColor="#30363D"
          color="#E6EDF3"
          borderRadius="8px"
          width="100px"
          _focus={{ borderColor: '#6C63FF' }}
          isDisabled={loading}
        >
          {tweak.available_options.map((opt) => (
            <option key={opt} value={opt} style={{ background: '#161B22', color: '#E6EDF3' }}>
              {opt}
            </option>
          ))}
        </Select>
      ) : (
        <Button
          size="xs"
          bg={tweak.is_optimized ? '#30363D' : '#6C63FF'}
          color={tweak.is_optimized ? '#8B949E' : 'white'}
          borderRadius="6px"
          _hover={{ bg: tweak.is_optimized ? '#30363D' : '#5A52D5' }}
          isLoading={loading}
          onClick={() => onApply(tweak.id, tweak.is_optimized ? 'default' : 'optimized')}
        >
          {tweak.is_optimized ? '恢复默认' : '优化'}
        </Button>
      )}
    </Flex>
  )
}

export function PeripheralOptimizePage() {
  const { t } = useTranslation()
  const toast = useToast()
  const [tweaks, setTweaks] = useState<PeripheralTweak[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [resetting, setResetting] = useState(false)

  const load = () => {
    setLoading(true)
    getPeripheralTweaks()
      .then(setTweaks)
      .catch((e) => toast({ title: '加载失败', description: String(e), status: 'error', duration: 3000 }))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleApply = async (id: string, value: string) => {
    setActionLoading(id)
    try {
      await applyPeripheralTweak(id, value)
      toast({ title: '设置已应用', status: 'success', duration: 2000 })
      load()
    } catch (e) {
      toast({ title: '设置失败', description: String(e), status: 'error', duration: 3000 })
    } finally {
      setActionLoading(null)
    }
  }

  const handleReset = async () => {
    setResetting(true)
    try {
      await resetPeripheralTweaks()
      toast({ title: '已恢复默认设置', status: 'success', duration: 2000 })
      load()
    } catch (e) {
      toast({ title: '重置失败', description: String(e), status: 'error', duration: 3000 })
    } finally {
      setResetting(false)
    }
  }

  const mouseTweaks = tweaks.filter((t) => t.category === 'mouse')
  const keyboardTweaks = tweaks.filter((t) => t.category === 'keyboard')
  const usbTweaks = tweaks.filter((t) => t.category === 'usb')

  const sectionIcon = (cat: string) => {
    switch (cat) {
      case 'mouse': return <Mouse size={14} color="#8B949E" />
      case 'keyboard': return <Keyboard size={14} color="#8B949E" />
      case 'usb': return <Usb size={14} color="#8B949E" />
      default: return null
    }
  }

  const renderSection = (cat: string, items: PeripheralTweak[]) => {
    if (items.length === 0) return null
    return (
      <>
        <Flex align="center" gap={2} mb={2} px={1}>
          {sectionIcon(cat)}
          <Text fontSize="sm" color="#8B949E" fontWeight={600} textTransform="capitalize">
            {cat === 'mouse' ? t('tuning.peripheral.mouse') : cat === 'keyboard' ? t('tuning.peripheral.keyboard') : t('tuning.peripheral.usb')}
          </Text>
        </Flex>
        <Box bg="#161B22" border="1px solid" borderColor="#30363D" borderRadius="12px" mb={6} overflow="hidden">
          {items.map((tweak, i) => (
            <Box key={tweak.id}>
              {i > 0 && <Divider borderColor="#30363D" />}
              <TweakItem tweak={tweak} onApply={handleApply} loading={actionLoading === tweak.id} />
            </Box>
          ))}
        </Box>
      </>
    )
  }

  return (
    <PageContainer>
      <Flex align="center" gap={2} mb={6}>
        <Box as={Mouse} size={20} color="#6C63FF" />
        <Text as="h1" fontSize="xl" fontWeight={700} color="#E6EDF3">
          {t('tuning.peripheral.title')}
        </Text>
      </Flex>

      {loading && (
        <Flex direction="column" align="center" justify="center" py={20} gap={4}>
          <Spinner size="xl" color="#6C63FF" />
          <Text color="#8B949E" fontSize="sm">{t('common.loading')}</Text>
        </Flex>
      )}

      {!loading && tweaks.length === 0 && (
        <Flex direction="column" align="center" justify="center" py={20} gap={4}>
          <Text color="#8B949E" fontSize="sm">无法加载外设优化信息</Text>
        </Flex>
      )}

      {!loading && tweaks.length > 0 && (
        <>
          {renderSection('mouse', mouseTweaks)}
          {renderSection('keyboard', keyboardTweaks)}
          {renderSection('usb', usbTweaks)}

          <Flex gap={3}>
            <Button
              size="sm"
              bg="#6C63FF"
              color="white"
              borderRadius="8px"
              _hover={{ bg: '#5A52D5' }}
              onClick={() => tweaks.forEach((t) => !t.is_optimized && handleApply(t.id, 'optimized'))}
            >
              {t('tuning.peripheral.optimizeAll')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              borderColor="#30363D"
              color="#E6EDF3"
              borderRadius="8px"
              _hover={{ bg: 'rgba(255,255,255,0.05)' }}
              isLoading={resetting}
              onClick={handleReset}
            >
              {t('tuning.peripheral.resetDefaults')}
            </Button>
          </Flex>
        </>
      )}
    </PageContainer>
  )
}
