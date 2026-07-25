import { Flex, Text, Switch, Badge, Box } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

interface ToggleRowProps {
  name: string
  description: string
  isOptimized: boolean
  currentValue: string
  onToggle: () => void
  riskLevel?: 'low' | 'medium' | 'high'
  requiresRestart?: boolean
  loading?: boolean
}

export function ToggleRow({
  name,
  description,
  isOptimized,
  currentValue,
  onToggle,
  riskLevel,
  requiresRestart,
  loading,
}: ToggleRowProps) {
  const { t } = useTranslation()

  const riskColor = {
    low: '#4ECDC4',
    medium: '#FFA500',
    high: '#FF5555',
  }

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
          bg={isOptimized ? '#4ECDC4' : '#636D7D'}
          flexShrink={0}
        />
        <Box flex={1}>
          <Flex align="center" gap={2} wrap="wrap">
            <Text fontSize="sm" color="#E6EDF3" fontWeight={500}>
              {name}
            </Text>
            {requiresRestart && (
              <Badge fontSize="10px" bg="rgba(255, 165, 0, 0.15)" color="#FFA500" borderRadius="4px" px={1.5}>
                {t('tuning.common.needsRestart')}
              </Badge>
            )}
            {riskLevel && riskLevel !== 'low' && (
              <Badge
                fontSize="10px"
                bg={`${riskColor[riskLevel]}20`}
                color={riskColor[riskLevel]}
                borderRadius="4px"
                px={1.5}
              >
                {riskLevel === 'medium' ? t('tuning.common.riskMedium') : t('tuning.common.riskHigh')}
              </Badge>
            )}
          </Flex>
          <Text fontSize="xs" color="#8B949E">
            {description}
          </Text>
          <Text fontSize="11px" color="#636D7D" fontFamily="monospace">
            {t('tuning.common.currentValue')}: {currentValue}
          </Text>
        </Box>
      </Flex>
      <Switch
        isChecked={isOptimized}
        onChange={onToggle}
        isDisabled={loading}
        colorScheme="purple"
        size="md"
        flexShrink={0}
      />
    </Flex>
  )
}
