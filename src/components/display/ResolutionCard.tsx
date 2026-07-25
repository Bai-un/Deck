import { Flex, Text, Button, Box } from '@chakra-ui/react'
import type { ResolutionPreset } from '../../types/display'

interface ResolutionCardProps {
  preset: ResolutionPreset
  onApply: (preset: ResolutionPreset) => void
  loading?: boolean
}

export function ResolutionCard({ preset, onApply, loading }: ResolutionCardProps) {
  return (
    <Flex
      direction="column"
      bg="#161B22"
      border="1px solid"
      borderColor={preset.is_current ? '#6C63FF' : preset.is_native ? '#4ECDC4' : '#30363D'}
      borderRadius="12px"
      p={4}
      gap={3}
      transition="all 0.2s"
      _hover={{ borderColor: preset.is_current ? '#6C63FF' : '#636D7D' }}
      opacity={preset.is_current ? 1 : 0.85}
    >
      <Flex align="center" justify="space-between">
        <Text fontSize="md" fontWeight={600} color="#E6EDF3">
          {preset.name}
        </Text>
        <Flex gap={1}>
          {preset.is_current && (
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
          {preset.is_native && (
            <Box
              bg="#4ECDC4"
              color="white"
              fontSize="10px"
              fontWeight={600}
              px={2}
              py={0.5}
              borderRadius="4px"
            >
              原生
            </Box>
          )}
        </Flex>
      </Flex>
      <Flex gap={3} fontSize="xs" color="#8B949E">
        <Text>{preset.aspect_ratio}</Text>
        <Text>{preset.refresh_rate} Hz</Text>
      </Flex>
      {!preset.is_current && (
        <Button
          size="xs"
          bg="#6C63FF"
          color="white"
          borderRadius="6px"
          _hover={{ bg: '#5A52D5' }}
          isLoading={loading}
          onClick={() => onApply(preset)}
        >
          切换
        </Button>
      )}
    </Flex>
  )
}
