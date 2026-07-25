import { Flex, Text, Box } from '@chakra-ui/react'
import type { SmartAttribute } from '../../types/tools'

interface Props {
  attr: SmartAttribute
}

export function SmartAttrRow({ attr }: Props) {
  const statusColor = attr.status === 'OK' ? '#4ECDC4' : attr.status === 'Warning' ? '#FFA500' : '#FF5555'
  const dotColor = attr.status === 'OK' ? '#4ECDC4' : attr.status === 'Warning' ? '#FFA500' : '#FF5555'

  return (
    <Flex align="center" justify="space-between" py={2} borderBottom="1px solid" borderColor="#30363D" _last={{ borderBottom: 'none' }}>
      <Flex align="center" gap={2} flex={2}>
        <Box w="6px" h="6px" borderRadius="full" bg={dotColor} />
        <Text fontSize="sm" color="#E6EDF3">{attr.name}</Text>
      </Flex>
      <Flex flex={3} justify="space-between" textAlign="center">
        <Text fontSize="xs" color="#8B949E" w="40px">{attr.value}</Text>
        <Text fontSize="xs" color="#8B949E" w="40px">{attr.worst}</Text>
        <Text fontSize="xs" color="#8B949E" w="40px">{attr.threshold}</Text>
        <Text fontSize="xs" color="#E6EDF3" w="80px" textAlign="right">{attr.raw_value}</Text>
      </Flex>
      <Box
        ml={3}
        bg={statusColor}
        color="black"
        fontSize="10px"
        fontWeight={600}
        px={2}
        py={0.5}
        borderRadius="4px"
      >
        {attr.status}
      </Box>
    </Flex>
  )
}
