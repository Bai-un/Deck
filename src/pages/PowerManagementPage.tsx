import { useEffect, useState } from 'react'
import { Flex, Text, Button, Box, SimpleGrid, Spinner, useToast } from '@chakra-ui/react'
import { Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '../components/ui/PageContainer'
import { PowerPlanCard } from '../components/tuning/PowerPlanCard'
import { getPowerPlans, activatePowerPlan, createDeckPowerPlan, deletePowerPlan } from '../lib/tuning-api'
import type { PowerPlan } from '../types/tuning'

export function PowerManagementPage() {
  const { t } = useTranslation()
  const toast = useToast()
  const [plans, setPlans] = useState<PowerPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const load = () => {
    setLoading(true)
    getPowerPlans()
      .then(setPlans)
      .catch((e) => toast({ title: '加载失败', description: String(e), status: 'error', duration: 3000 }))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleSwitch = async (guid: string) => {
    setActionLoading(true)
    try {
      await activatePowerPlan(guid)
      toast({ title: '电源方案已切换', status: 'success', duration: 2000 })
      load()
    } catch (e) {
      toast({ title: '切换失败', description: String(e), status: 'error', duration: 3000 })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateDeck = async () => {
    setActionLoading(true)
    try {
      await createDeckPowerPlan()
      toast({ title: 'Deck 极致性能方案已创建并激活', status: 'success', duration: 3000 })
      load()
    } catch (e) {
      toast({ title: '创建失败', description: String(e), status: 'error', duration: 3000 })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteDeck = async (guid: string) => {
    setActionLoading(true)
    try {
      await deletePowerPlan(guid)
      toast({ title: '已删除自定义方案', status: 'success', duration: 2000 })
      load()
    } catch (e) {
      toast({ title: '删除失败', description: String(e), status: 'error', duration: 3000 })
    } finally {
      setActionLoading(false)
    }
  }

  const builtinPlans = plans.filter((p) => p.is_builtin)
  const deckPlan = plans.find((p) => !p.is_builtin)

  return (
    <PageContainer>
      <Flex align="center" gap={2} mb={6}>
        <Box as={Zap} size={20} color="#6C63FF" />
        <Text as="h1" fontSize="xl" fontWeight={700} color="#E6EDF3">
          {t('tuning.power.title')}
        </Text>
      </Flex>

      {loading && (
        <Flex direction="column" align="center" justify="center" py={20} gap={4}>
          <Spinner size="xl" color="#6C63FF" />
          <Text color="#8B949E" fontSize="sm">{t('common.loading')}</Text>
        </Flex>
      )}

      {!loading && (
        <>
          {/* Built-in plans */}
          <Text fontSize="sm" color="#8B949E" fontWeight={600} mb={3} px={1}>
            {t('tuning.power.builtinPlans')}
          </Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={3} mb={6}>
            {builtinPlans.map((plan) => (
              <PowerPlanCard
                key={plan.guid}
                plan={plan}
                onSwitch={handleSwitch}
                loading={actionLoading}
              />
            ))}
          </SimpleGrid>

          {/* Custom Deck plan */}
          <Text fontSize="sm" color="#8B949E" fontWeight={600} mb={3} px={1}>
            {t('tuning.power.customPlan')}
          </Text>
          {deckPlan ? (
            <PowerPlanCard
              plan={deckPlan}
              onSwitch={handleSwitch}
              onDeleteDeck={handleDeleteDeck}
              loading={actionLoading}
            />
          ) : (
            <Flex
              direction="column"
              align="center"
              justify="center"
              bg="#161B22"
              border="1px dashed"
              borderColor="#30363D"
              borderRadius="12px"
              p={6}
              gap={3}
            >
              <Text fontSize="sm" color="#8B949E">
                {t('tuning.power.deckPlanDesc')}
              </Text>
              <Button
                size="sm"
                bg="#6C63FF"
                color="white"
                borderRadius="8px"
                _hover={{ bg: '#5A52D5' }}
                isLoading={actionLoading}
                onClick={handleCreateDeck}
              >
                {t('tuning.power.createAndActivate')}
              </Button>
            </Flex>
          )}
        </>
      )}
    </PageContainer>
  )
}
