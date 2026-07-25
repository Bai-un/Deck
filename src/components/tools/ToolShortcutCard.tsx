import { Flex, Text, Box } from '@chakra-ui/react'
import * as icons from 'lucide-react'
import type { BuiltinTool } from '../../types/tools'

interface Props {
  tool: BuiltinTool
  onClick: () => void
}

export function ToolShortcutCard({ tool, onClick }: Props) {
  const IconComponent = (icons as any)[tool.icon] || icons.Terminal

  const categoryColors: Record<string, string> = {
    system: '#6C63FF',
    systemInfo: '#4ECDC4',
    network: '#00B4D8',
    disk: '#FFA500',
    security: '#FF5555',
  }

  const catColor = categoryColors[tool.category] || '#6C63FF'

  return (
    <Flex
      direction="column"
      bg="#161B22"
      border="1px solid"
      borderColor="#30363D"
      borderRadius="12px"
      p={4}
      gap={2}
      cursor="pointer"
      transition="all 0.2s"
      _hover={{ borderColor: catColor, boxShadow: `0 4px 12px rgba(0,0,0,0.3)` }}
      onClick={onClick}
      position="relative"
    >
      {tool.requires_admin && (
        <Box
          position="absolute"
          top={2}
          right={2}
          bg="#FFA500"
          color="black"
          fontSize="9px"
          fontWeight={700}
          px={1.5}
          py={0.5}
          borderRadius="4px"
        >
          管理员
        </Box>
      )}
      <Box as={IconComponent} size={20} color={catColor} />
      <Text fontSize="sm" fontWeight={600} color="#E6EDF3">
        {tool.name}
      </Text>
      <Text fontSize="xs" color="#636D7D" lineHeight="short">
        {tool.description}
      </Text>
    </Flex>
  )
}
