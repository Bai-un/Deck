import { useEffect, useState } from 'react'
import { Flex, Text, Button, Box, Divider, Spinner, useToast } from '@chakra-ui/react'
import { Wifi, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '../components/ui/PageContainer'
import { ToggleRow } from '../components/tuning/ToggleRow'
import { getNetworkTweaks, applyNetworkTweak, resetNetworkTweaks } from '../lib/tuning-api'
import type { NetworkTweak } from '../types/tuning'

export function NetworkOptimizerPage() {
  const { t } = useTranslation()
  const toast = useToast()
  const [tweaks, setTweaks] = useState<NetworkTweak[]>([])
  const [loading, setLoading] = useState(true)
  const [applyingId, setApplyingId] = useState<string | null>(null)
  const [resetting, setResetting] = useState(false)
  const [needsAdmin, setNeedsAdmin] = useState(false)

  const load = () => {
    setLoading(true)
    getNetworkTweaks()
      .then(setTweaks)
      .catch((e) => {
        toast({ title: '加载失败', description: String(e), status: 'error', duration: 3000 })
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleToggle = async (tweak: NetworkTweak) => {
    setApplyingId(tweak.id)
    try {
      const target = tweak.is_optimized ? 'default' : 'optimized'
      const result = await applyNetworkTweak(tweak.id, target)
      if (result.success) {
        toast({
          title: result.message,
          status: 'success',
          duration: 2000,
        })
        if (result.needs_restart) {
          setNeedsAdmin(true)
        }
        load()
      } else {
        toast({ title: '操作失败', description: result.message, status: 'error', duration: 3000 })
        if (result.message.includes('denied') || result.message.includes('权限')) {
          setNeedsAdmin(true)
        }
      }
    } catch (e: any) {
      toast({ title: '操作失败', description: String(e), status: 'error', duration: 3000 })
      if (String(e).includes('denied') || String(e).includes('权限') || String(e).includes('管理员')) {
        setNeedsAdmin(true)
      }
    } finally {
      setApplyingId(null)
    }
  }

  const handleReset = async () => {
    setResetting(true)
    try {
      await resetNetworkTweaks()
      toast({ title: '已恢复默认设置', status: 'success', duration: 2000 })
      load()
    } catch (e) {
      toast({ title: '重置失败', description: String(e), status: 'error', duration: 3000 })
    } finally {
      setResetting(false)
    }
  }

  const tcpTweaks = tweaks.filter((t) => t.category === 'tcp')
  const dnsTweaks = tweaks.filter((t) => t.category === 'dns')

  return (
    <PageContainer>
      <Flex align="center" gap={2} mb={6}>
        <Box as={Wifi} size={20} color="#6C63FF" />
        <Text as="h1" fontSize="xl" fontWeight={700} color="#E6EDF3">
          {t('tuning.network.title')}
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
          <Text color="#8B949E" fontSize="sm">无法加载网络调优信息</Text>
        </Flex>
      )}

      {!loading && tweaks.length > 0 && (
        <>
          {/* TCP Section */}
          <Text fontSize="sm" color="#8B949E" fontWeight={600} mb={2} px={1}>
            {t('tuning.network.tcpSection')}
          </Text>
          <Box bg="#161B22" border="1px solid" borderColor="#30363D" borderRadius="12px" mb={6} overflow="hidden">
            {tcpTweaks.map((tweak, i) => (
              <Box key={tweak.id}>
                {i > 0 && <Divider borderColor="#30363D" />}
                <ToggleRow
                  name={tweak.name}
                  description={tweak.description}
                  isOptimized={tweak.is_optimized}
                  currentValue={tweak.current_value}
                  onToggle={() => handleToggle(tweak)}
                  riskLevel={tweak.risk_level as any}
                  requiresRestart={tweak.requires_restart}
                  loading={applyingId === tweak.id}
                />
              </Box>
            ))}
          </Box>

          {/* DNS Section */}
          <Text fontSize="sm" color="#8B949E" fontWeight={600} mb={2} px={1}>
            {t('tuning.network.dnsSection')}
          </Text>
          <Box bg="#161B22" border="1px solid" borderColor="#30363D" borderRadius="12px" mb={6} overflow="hidden">
            {dnsTweaks.map((tweak, i) => (
              <Box key={tweak.id}>
                {i > 0 && <Divider borderColor="#30363D" />}
                <ToggleRow
                  name={tweak.name}
                  description={tweak.description}
                  isOptimized={tweak.is_optimized}
                  currentValue={tweak.current_value}
                  onToggle={() => handleToggle(tweak)}
                  riskLevel={tweak.risk_level as any}
                  loading={applyingId === tweak.id}
                />
              </Box>
            ))}
          </Box>

          {/* Actions */}
          <Flex gap={3} mb={6}>
            <Button
              size="sm"
              bg="#6C63FF"
              color="white"
              borderRadius="8px"
              _hover={{ bg: '#5A52D5' }}
              onClick={() => tweaks.forEach((t) => !t.is_optimized && handleToggle(t))}
            >
              {t('tuning.network.optimizeAll')}
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
              {t('tuning.network.resetDefaults')}
            </Button>
          </Flex>
        </>
      )}

      {/* Needs admin warning */}
      {needsAdmin && (
        <Flex
          align="center"
          gap={2}
          bg="rgba(255, 165, 0, 0.1)"
          border="1px solid"
          borderColor="rgba(255, 165, 0, 0.3)"
          borderRadius="8px"
          p={3}
        >
          <AlertTriangle size={16} color="#FFA500" />
          <Text fontSize="xs" color="#FFA500">
            {t('tuning.network.needsAdmin')}
          </Text>
        </Flex>
      )}
    </PageContainer>
  )
}
