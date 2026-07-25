import { Flex, Text, Button, Box } from '@chakra-ui/react'
import type { PowerPlan } from '../../types/tuning'

interface PowerPlanCardProps {
  plan: PowerPlan
  onSwitch: (guid: string) => void
  onCreateDeck?: () => void
  onDeleteDeck?: (guid: string) => void
  loading?: boolean
}

export function PowerPlanCard({ plan, onSwitch, onDeleteDeck, loading }: PowerPlanCardProps) {
  return (
    <Flex
      direction="column"
      bg="#161B22"
      border="1px solid"
      borderColor={plan.is_active ? '#6C63FF' : '#30363D'}
      borderRadius="12px"
      p={4}
      gap={3}
      transition="all 0.2s"
      _hover={{ borderColor: plan.is_active ? '#6C63FF' : '#636D7D' }}
      opacity={plan.is_active ? 1 : 0.85}
    >
      <Flex align="center" justify="space-between">
        <Text fontSize="sm" fontWeight={600} color="#E6EDF3">
          {plan.name}
        </Text>
        {plan.is_active && (
          <Box
            bg="#6C63FF"
            color="white"
            fontSize="10px"
            fontWeight={600}
            px={2}
            py={0.5}
            borderRadius="4px"
          >
            当前
          </Box>
        )}
      </Flex>
      {plan.description && (
        <Text fontSize="xs" color="#8B949E">
          {plan.description}
        </Text>
      )}
      <Flex gap={2} mt="auto">
        {!plan.is_active && (
          <Button
            size="xs"
            bg="#6C63FF"
            color="white"
            borderRadius="6px"
            _hover={{ bg: '#5A52D5' }}
            isLoading={loading}
            onClick={() => onSwitch(plan.guid)}
            flex={1}
          >
            切换
          </Button>
        )}
        {plan.is_active && !plan.is_builtin && onDeleteDeck && (
          <Button
            size="xs"
            variant="outline"
            borderColor="#FF5555"
            color="#FF5555"
            borderRadius="6px"
            _hover={{ bg: 'rgba(255,85,85,0.1)' }}
            isLoading={loading}
            onClick={() => onDeleteDeck(plan.guid)}
            flex={1}
          >
            删除
          </Button>
        )}
        {!plan.is_active && !plan.is_builtin && onDeleteDeck && (
          <Button
            size="xs"
            variant="outline"
            borderColor="#30363D"
            color="#8B949E"
            borderRadius="6px"
            _hover={{ bg: 'rgba(255,255,255,0.05)' }}
            isLoading={loading}
            onClick={() => onDeleteDeck(plan.guid)}
          >
            删除
          </Button>
        )}
      </Flex>
    </Flex>
  )
}
